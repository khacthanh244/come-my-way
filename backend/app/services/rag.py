import json
from typing import AsyncGenerator

import httpx

from app.config import settings
from app.services.vectorstore import get_vectorstore

SYSTEM_PROMPT = """Bạn là trợ lý hỗ trợ merchant chuyên nghiệp, am hiểu nghiệp vụ thanh toán ZaloPay và lập trình.

Nguyên tắc trả lời:
- Nếu câu hỏi liên quan đến nghiệp vụ merchant/ZaloPay và tài liệu tham khảo có thông tin: ưu tiên trả lời dựa trên tài liệu và trích dẫn tên tài liệu nguồn.
- Nếu câu hỏi KHÔNG liên quan đến tài liệu (ví dụ: lập trình tổng quát, convert code, kiến thức chung): hãy trả lời bình thường bằng kiến thức của bạn, bỏ qua tài liệu tham khảo.
- Nếu câu hỏi liên quan đến tài liệu nhưng tài liệu không có thông tin: nói rõ "Tôi không tìm thấy thông tin này trong tài liệu hướng dẫn", sau đó có thể gợi ý thêm theo kiến thức chung (ghi rõ phần này không lấy từ tài liệu).
- Luôn bám theo ngữ cảnh hội thoại trước đó để hiểu câu hỏi follow-up.
- Trả lời ngắn gọn, rõ ràng, thân thiện và chuyên nghiệp."""

MAX_HISTORY_TURNS = 10


def _build_context(docs: list) -> tuple[str, list[str]]:
    context_parts = []
    sources = []
    for doc in docs:
        source = doc.metadata.get("source", "Unknown")
        page = doc.metadata.get("page", "")
        label = f"{source} (trang {page + 1})" if page != "" else source
        context_parts.append(f"[{label}]\n{doc.page_content}")
        if source not in sources:
            sources.append(source)
    return "\n\n---\n\n".join(context_parts), sources


def _build_retrieval_query(message: str, history: list[dict]) -> str:
    # Follow-up questions ("như sao?") embed poorly on their own, so include
    # the last few user turns to keep retrieval anchored to the topic.
    recent_user = [t["content"] for t in history if t["role"] == "user"][-2:]
    return "\n".join(recent_user + [message])


def _build_agent_message(message: str, history: list[dict], context: str) -> str:
    # The agent endpoint accepts a single "message" string, so system prompt,
    # context, and history are flattened into one prompt.
    parts = [SYSTEM_PROMPT]

    parts.append(
        "Tài liệu tham khảo (CÓ THỂ không liên quan đến câu hỏi — nếu không liên quan, "
        "hãy bỏ qua và trả lời bằng kiến thức của bạn):\n\n" + context
    )

    if history:
        history_lines = []
        for turn in history[-MAX_HISTORY_TURNS:]:
            speaker = "Merchant" if turn["role"] == "user" else "Trợ lý"
            history_lines.append(f"{speaker}: {turn['content']}")
        parts.append("Hội thoại trước đó:\n" + "\n".join(history_lines))

    parts.append(f"Câu hỏi mới của merchant: {message}")
    return "\n\n---\n\n".join(parts)


def _retrieve(message: str, history: list[dict]) -> tuple[str, list[str]]:
    vectorstore = get_vectorstore()
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
    relevant_docs = retriever.invoke(_build_retrieval_query(message, history))
    return _build_context(relevant_docs)


async def _call_agent(prompt: str) -> str:
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            settings.agent_endpoint_url,
            json={"message": prompt},
        )
        resp.raise_for_status()
        data = resp.json()
    if data.get("status") != "success":
        raise RuntimeError(f"Agent endpoint error: {data}")
    return data["response"]


async def rag_answer(message: str, history: list[dict]) -> dict:
    context, sources = _retrieve(message, history)
    answer = await _call_agent(_build_agent_message(message, history, context))
    return {"answer": answer, "sources": sources}


async def rag_stream(message: str, history: list[dict]) -> AsyncGenerator[str, None]:
    context, sources = _retrieve(message, history)

    # Yield sources metadata first as SSE
    sources_line = ",".join(sources)
    yield f"data: [SOURCES]{sources_line}[/SOURCES]\n\n"

    # The agent endpoint does not stream; the full answer is sent as one chunk
    # to preserve the SSE contract with the frontend. JSON-encoded so newlines
    # in the answer survive SSE line framing.
    answer = await _call_agent(_build_agent_message(message, history, context))
    yield f"data: {json.dumps(answer, ensure_ascii=False)}\n\n"

    yield "data: [DONE]\n\n"
