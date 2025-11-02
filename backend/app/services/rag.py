"""Placeholder RAG service.

Implement retrieval-augmented generation integration here later.
This file provides a small class stub and usage examples for the future.
"""
from typing import List

class RAGService:
    def __init__(self):
        # Initialize embeddings / index clients here
        self.ready = False

    async def index_documents(self, docs: List[str]):
        # Index documents for retrieval
        raise NotImplementedError()

    async def query(self, question: str) -> str:
        # Retrieve relevant passages and run generator
        raise NotImplementedError()

# singleton
rag_service = RAGService()
