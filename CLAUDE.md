# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

---

## Project Overview

AI chatbot (RAG-based) hỗ trợ merchant tra cứu thông tin từ tài liệu hướng dẫn PDF. Backend dùng FastAPI + LangChain + ChromaDB, frontend dùng React + TypeScript + Vite + Tailwind CSS v4.

## Commands

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Ingest PDFs into ChromaDB (run once, or after adding new PDFs)
python scripts/ingest.py

# Start API server (port 8000)
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # dev server at localhost:5173 (proxies /api → localhost:8000)
npm run build     # tsc + vite build
npm run lint      # eslint
```

### Environment

Copy `backend/.env.example` → `backend/.env` and set `OPENAI_API_KEY`.
The backend must be run from the `backend/` directory so relative paths (`.env`, `chroma_db/`, `data/pdfs/`) resolve correctly.

## Architecture

### RAG Data Flow

```
PDF files (backend/data/pdfs/)
  → scripts/ingest.py          # PyPDFLoader → chunk (1000/200) → embed → Chroma
  → backend/chroma_db/         # persisted vector store

User message (React UI)
  → POST /api/chat             # FastAPI route
  → services/rag.py            # retriever.invoke(query) → top-5 chunks
  → GPT-4o (OpenAI)            # system prompt + context + history
  → SSE stream back to browser
```

### Backend (`backend/app/`)

- **`config.py`** — `pydantic-settings` reads `.env`; singleton `settings` object imported everywhere
- **`services/vectorstore.py`** — `@lru_cache` singleton that returns a `Chroma` instance; must be seeded by `ingest.py` first
- **`services/rag.py`** — two entry points: `rag_answer()` (non-streaming) and `rag_stream()` (async generator for SSE). SSE format: `[SOURCES]...[/SOURCES]` line first, then content chunks, then `[DONE]`
- **`routes/chat.py`** — single `POST /api/chat` endpoint; `stream: bool` in request body selects between `StreamingResponse` and JSON

### Frontend (`frontend/src/`)

- **`hooks/useChat.ts`** — all state and API logic lives here; parses `[SOURCES]...[/SOURCES]` SSE prefix to extract source file names; messages identified by `crypto.randomUUID()`
- **`components/ChatWindow.tsx`** — emits a `suggest-question` custom window event when user clicks a suggestion; `App.tsx` listens and calls `sendMessage`
- Tailwind CSS v4 is configured via `@tailwindcss/vite` plugin (no `tailwind.config.js`); import is `@import "tailwindcss"` in `index.css`

### Key Design Decisions

- Vite dev server proxies `/api` to `http://localhost:8000` — no CORS issues in development
- ChromaDB is persisted to `backend/chroma_db/` (git-ignored); re-run `ingest.py` to rebuild
- Conversation history is passed client-side on each request (stateless backend)
- Streaming uses native `fetch` + `ReadableStream`; no extra SSE library needed
