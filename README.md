# Come My Way — Merchant Support AI Chatbot

AI chatbot hỗ trợ merchant tra cứu thông tin từ tài liệu hướng dẫn PDF, không cần liên hệ support team.

Zalopay Sky Agent

Zalopay đang cung cấp nhiều giải pháp thanh toán cho đa dạng nhóm merchant. Tuy nhiên trong quá trình tìm hiểu sản phẩm, lựa chọn phương án tích hợp và triển khai kỹ thuật, merchant thường phải trao đổi qua lại nhiều lần với đội ngũ hỗ trợ để làm rõ tài liệu, luồng nghiệp vụ và cách tích hợp. Điều này tạo ra khối lượng lớn câu hỏi lặp lại, kéo dài thời gian go-live, ảnh hưởng SLA hỗ trợ và trải nghiệm của cả merchant lẫn Zalopay.

Zalopay Sky Agent được xây dựng để trở thành chuyên gia hỗ trợ tích hợp AI 24/7, phục vụ hai nhóm người dùng chính:

* **Business/Non-tech Merchant:** cần hiểu giải pháp phù hợp với mô hình kinh doanh, luồng thanh toán, điều kiện triển khai và các bước cần thực hiện. Link: https://endpoint-15f8ec91-d897-4115-9a68-ae732e37b29f.agentbase-runtime.aiplatform.vngcloud.vn/
* **Technical Merchant (Developer):** cần hướng dẫn chi tiết về API, flow tích hợp, webhook, xử lý lỗi, debug và hỗ trợ sinh mã nguồn triển khai. Link: https://endpoint-15f8ec91-d897-4115-9a68-ae732e37b29f.agentbase-runtime.aiplatform.vngcloud.vn/dev

Khi nhận câu hỏi từ merchant hoặc developer, Agent sẽ phân tích ý định người dùng, truy xuất thông tin từ tài liệu chính thức, FAQ, playbook xử lý lỗi và knowledge base của Zalopay. Dựa trên trình độ người dùng, Agent sẽ tự động điều chỉnh mức độ chi tiết của câu trả lời: từ giải thích tổng quan, sơ đồ luồng đơn giản cho người không chuyên đến hướng dẫn kỹ thuật chuyên sâu cho developer.

Đối với nhóm kỹ thuật, Agent không chỉ giải thích tài liệu mà còn có khả năng sinh code mẫu dựa trên tài liệu tích hợp của Zalopay, hỗ trợ nhiều ngôn ngữ phổ biến như Java, NodeJS, Python và PHP. Agent có thể đề xuất đoạn mã gọi API, xử lý webhook, verify signature, kiểm tra lỗi và hướng dẫn debug theo từng tình huống cụ thể, giúp developer rút ngắn thời gian tích hợp và giảm phụ thuộc vào đội ngũ hỗ trợ.

Điểm khác biệt của giải pháp là giao diện hội thoại trực quan, thân thiện với người dùng non-tech, cho phép tương tác đa lượt để làm rõ nhu cầu thay vì chỉ trả về kết quả tìm kiếm tài liệu. Agent có khả năng trình bày nội dung theo dạng hướng dẫn từng bước, sơ đồ luồng, checklist, video demo minh họa và mã nguồn mẫu giúp merchant dễ dàng hiểu và triển khai. Thông tin được hệ thống hóa, chuẩn hóa và cá nhân hóa theo từng tình huống sử dụng, giúp giảm tải cho đội ngũ hỗ trợ, rút ngắn thời gian tích hợp, nâng cao trải nghiệm merchant và tăng tốc độ go-live cho các giải pháp thanh toán của Zalopay.



## Kiến trúc

```
PDF files → Ingest script → ChromaDB (vector embeddings)
                                    ↓
Merchant → React UI → FastAPI /api/chat → RAG chain → GPT-4o → Streaming response
```

**Tech stack:**
- **Backend:** Python 3.11+ · FastAPI · LangChain · ChromaDB
- **LLM:** OpenAI GPT-4o · Embeddings: text-embedding-3-small
- **Frontend:** React 18 · TypeScript · Vite · Tailwind CSS

---

## Cấu trúc thư mục

```
come-my-way/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Cấu hình từ .env
│   │   ├── routes/
│   │   │   └── chat.py          # POST /api/chat, GET /api/health
│   │   └── services/
│   │       ├── vectorstore.py   # ChromaDB client
│   │       └── rag.py           # RAG pipeline + streaming
│   ├── scripts/
│   │   └── ingest.py            # Script nạp PDF vào ChromaDB
│   ├── data/
│   │   └── pdfs/                # Thả file PDF vào đây
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── hooks/useChat.ts
    │   └── components/
    │       ├── ChatWindow.tsx
    │       ├── MessageBubble.tsx
    │       └── InputBar.tsx
    └── package.json
```

---

## Hướng dẫn cài đặt & chạy

### Yêu cầu

- Python 3.11+
- Node.js 18+
- OpenAI API key

### 1. Clone & cấu hình

```bash
git clone https://github.com/khacthanh244/come-my-way.git
cd come-my-way
```

### 2. Backend

```bash
cd backend

# Tạo virtual environment
python -m venv .venv
source .venv/bin/activate      # macOS/Linux
# .venv\Scripts\activate       # Windows

# Cài dependencies
pip install -r requirements.txt

# Cấu hình API key
cp .env.example .env
# Mở .env và điền OPENAI_API_KEY=sk-...
```

### 3. Nạp tài liệu PDF

```bash
# Thả các file PDF vào thư mục data/pdfs/
cp /path/to/your/*.pdf data/pdfs/

# Chạy ingest (chỉ cần chạy 1 lần, hoặc khi có PDF mới)
python scripts/ingest.py

# Kết quả: "Done! Stored X chunks in ChromaDB"
```

### 4. Khởi động backend

```bash
# Đảm bảo đang ở thư mục backend/ và venv đã active
uvicorn app.main:app --reload
# → Backend chạy tại http://localhost:8000
```

Kiểm tra hoạt động:
```bash
curl http://localhost:8000/api/health
# → {"status":"ok"}
```

### 5. Frontend

```bash
# Terminal mới
cd frontend
npm install
npm run dev
# → Mở http://localhost:5173
```

---

## API

### `POST /api/chat`

```json
// Request
{
  "message": "Cách tạo sản phẩm mới?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "stream": true
}

// Response (stream: false)
{
  "answer": "Để tạo sản phẩm mới, bạn...",
  "sources": ["huong_dan_san_pham.pdf"]
}
```

Khi `stream: true`, response là Server-Sent Events (SSE):
```
data: [SOURCES]file1.pdf,file2.pdf[/SOURCES]
data: Để tạo sản...
data: phẩm mới...
data: [DONE]
```

### `GET /api/health`

```json
{ "status": "ok" }
```

---

## Thêm tài liệu PDF mới

```bash
cp new_document.pdf backend/data/pdfs/
cd backend
python scripts/ingest.py
# Restart backend để load vectorstore mới
```
