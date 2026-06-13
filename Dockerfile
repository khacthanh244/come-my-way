# --- Stage 1: build frontend ---
FROM node:20-slim AS frontend
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# --- Stage 2: backend runtime ---
FROM python:3.12-slim
WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# torch CPU-only wheel keeps the image smaller than the default CUDA build
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir langchain-huggingface sentence-transformers

# Pre-download the embedding model into the image (avoids cold-start download)
RUN python -c "from langchain_huggingface import HuggingFaceEmbeddings; HuggingFaceEmbeddings(model_name='sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')"

COPY backend/app ./app
COPY backend/chroma_db ./chroma_db
COPY backend/data ./data
COPY --from=frontend /fe/dist ./static

EXPOSE 8080
CMD ["uvicorn", "app.serve:app", "--host", "0.0.0.0", "--port", "8080"]
