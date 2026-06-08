"""
Run this script once to ingest PDFs into ChromaDB.
Usage: python scripts/ingest.py [--pdf-dir data/pdfs]
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path

from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings


def ingest(pdf_dir: str) -> None:
    pdf_path = Path(pdf_dir)
    pdf_files = list(pdf_path.glob("*.pdf"))

    if not pdf_files:
        print(f"No PDF files found in {pdf_dir}")
        return

    print(f"Found {len(pdf_files)} PDF file(s): {[f.name for f in pdf_files]}")

    docs = []
    for pdf_file in pdf_files:
        print(f"Loading {pdf_file.name}...")
        loader = PyPDFLoader(str(pdf_file))
        pages = loader.load()
        for page in pages:
            page.metadata["source"] = pdf_file.name
        docs.extend(pages)

    print(f"Total pages loaded: {len(docs)}")

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)
    print(f"Total chunks after splitting: {len(chunks)}")

    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        openai_api_key=settings.openai_api_key,
    )

    print("Embedding and storing in ChromaDB...")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=settings.collection_name,
        persist_directory=settings.chroma_db_path,
    )

    print(f"Done! Stored {vectorstore._collection.count()} chunks in ChromaDB at '{settings.chroma_db_path}'")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest PDFs into ChromaDB")
    parser.add_argument("--pdf-dir", default="data/pdfs", help="Directory containing PDF files")
    args = parser.parse_args()
    ingest(args.pdf_dir)
