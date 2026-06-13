"""
Run this script once to ingest documents (PDF, Markdown) into ChromaDB.
Usage: python scripts/ingest.py [--data-dir data/pdfs]
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path

from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings


def ingest(data_dir: str) -> None:
    data_path = Path(data_dir)
    pdf_files = sorted(data_path.glob("*.pdf"))
    md_files = sorted(data_path.glob("*.md"))

    if not pdf_files and not md_files:
        print(f"No PDF or Markdown files found in {data_dir}")
        return

    names = [f.name for f in pdf_files + md_files]
    print(f"Found {len(names)} file(s): {names}")

    docs = []
    for pdf_file in pdf_files:
        print(f"Loading {pdf_file.name}...")
        loader = PyPDFLoader(str(pdf_file))
        pages = loader.load()
        for page in pages:
            page.metadata["source"] = pdf_file.name
        docs.extend(pages)

    for md_file in md_files:
        print(f"Loading {md_file.name}...")
        loader = TextLoader(str(md_file), encoding="utf-8")
        md_docs = loader.load()
        for doc in md_docs:
            doc.metadata["source"] = md_file.name
        docs.extend(md_docs)

    print(f"Total documents loaded: {len(docs)}")

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)
    print(f"Total chunks after splitting: {len(chunks)}")

    embeddings = HuggingFaceEmbeddings(model_name=settings.embedding_model)

    print("Embedding and storing in ChromaDB...")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=settings.collection_name,
        persist_directory=settings.chroma_db_path,
    )

    print(f"Done! Stored {vectorstore._collection.count()} chunks in ChromaDB at '{settings.chroma_db_path}'")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest PDF and Markdown files into ChromaDB")
    parser.add_argument(
        "--data-dir", "--pdf-dir", dest="data_dir", default="data/pdfs",
        help="Directory containing PDF/Markdown files",
    )
    args = parser.parse_args()
    ingest(args.data_dir)
