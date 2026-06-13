# Come My Way — Merchant Support AI Chatbot

AI chatbot hỗ trợ merchant tra cứu thông tin từ tài liệu hướng dẫn PDF, không cần liên hệ support team.

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
