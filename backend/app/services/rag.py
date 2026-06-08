from typing import AsyncGenerator

from langchain_openai import ChatOpenAI
from openai import AsyncOpenAI

from app.config import settings
from app.services.vectorstore import get_vectorstore

SYSTEM_PROMPT = """Bạn là trợ lý hỗ trợ merchant chuyên nghiệp. Nhiệm vụ của bạn là trả lời các câu hỏi của merchant dựa trên tài liệu hướng dẫn được cung cấp.

Nguyên tắc:
- Chỉ trả lời dựa trên thông tin có trong tài liệu được cung cấp (context)
- Nếu không tìm thấy thông tin liên quan, hãy nói rõ: "Tôi không tìm thấy thông tin về vấn đề này trong tài liệu hướng dẫn"
- Trả lời ngắn gọn, rõ ràng và đúng trọng tâm
- Sử dụng ngôn ngữ thân thiện, chuyên nghiệp
- Khi cần, hãy trích dẫn tên tài liệu nguồn"""


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


async def rag_answer(message: str, history: list[dict]) -> dict:
    vectorstore = get_vectorstore()
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
    relevant_docs = retriever.invoke(message)

    context, sources = _build_context(relevant_docs)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for turn in history:
        messages.append({"role": turn["role"], "content": turn["content"]})

    user_message = f"""Dựa trên tài liệu sau:\n\n{context}\n\n---\n\nCâu hỏi: {message}"""
    messages.append({"role": "user", "content": user_message})

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.2,
    )
    answer = response.choices[0].message.content

    return {"answer": answer, "sources": sources}


async def rag_stream(message: str, history: list[dict]) -> AsyncGenerator[str, None]:
    vectorstore = get_vectorstore()
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
    relevant_docs = retriever.invoke(message)

    context, sources = _build_context(relevant_docs)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for turn in history:
        messages.append({"role": turn["role"], "content": turn["content"]})

    user_message = f"""Dựa trên tài liệu sau:\n\n{context}\n\n---\n\nCâu hỏi: {message}"""
    messages.append({"role": "user", "content": user_message})

    client = AsyncOpenAI(api_key=settings.openai_api_key)

    # Yield sources metadata first as SSE
    sources_line = ",".join(sources)
    yield f"data: [SOURCES]{sources_line}[/SOURCES]\n\n"

    async with client.chat.completions.stream(
        model="gpt-4o",
        messages=messages,
        temperature=0.2,
    ) as stream:
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield f"data: {delta}\n\n"

    yield "data: [DONE]\n\n"
