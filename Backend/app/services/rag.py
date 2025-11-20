"""RAG service for parenting guidance queries.

Integrates the RAG pipeline from rag_assets to provide answers based on indexed documents.
"""
from typing import Dict, Any, Optional
import sys
from pathlib import Path

# Add rag_assets to path for imports
rag_assets_path = Path(__file__).parent.parent.parent / "rag_assets"
if str(rag_assets_path) not in sys.path:
    sys.path.insert(0, str(rag_assets_path))

class RAGService:
    """Service for answering parenting questions using RAG pipeline."""
    
    def __init__(self):
        self.ready = False
        self._rag_module = None
        self._initialize()

    def _initialize(self):
        """Lazy initialization of RAG components."""
        try:
            # Import rag_core from rag_assets
            import rag_core
            self._rag_module = rag_core
            # Test that collection exists
            self._rag_module.get_collection()
            self.ready = True
            print("✓ RAG service initialized successfully")
        except Exception as e:
            print(f"⚠ RAG service initialization failed: {e}")
            print("  RAG endpoints will return fallback responses.")
            self.ready = False

    async def query(
        self, 
        question: str, 
        top_k: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Query the RAG system with a parenting question.
        
        Args:
            question: The user's question
            top_k: Number of relevant chunks to retrieve (default from config)
            
        Returns:
            Dict with keys: question, answer, chunks, prompt
        """
        if not self.ready or not self._rag_module:
            return {
                "question": question,
                "answer": (
                    "RAG service is not available. Please ensure the vector database "
                    "has been built by running: python -m rag_assets.vectorstore_build"
                ),
                "chunks": [],
                "prompt": None,
                "error": "RAG service not initialized"
            }
        
        try:
            # Use default top_k if not specified
            k = top_k if top_k is not None else self._rag_module.DEFAULT_TOP_K
            result = self._rag_module.answer(question, k=k)
            return result
        except Exception as e:
            print(f"RAG query error: {e}")
            return {
                "question": question,
                "answer": f"Error processing your question: {str(e)}",
                "chunks": [],
                "prompt": None,
                "error": str(e)
            }

    def get_status(self) -> Dict[str, Any]:
        """Get RAG service status and configuration."""
        if not self.ready:
            return {
                "ready": False,
                "message": "RAG service not initialized"
            }
        
        try:
            collection = self._rag_module.get_collection()
            count = collection.count()
            return {
                "ready": True,
                "collection": self._rag_module.CHROMA_COLLECTION,
                "document_count": count,
                "chroma_dir": str(self._rag_module.CHROMA_DIR),
                "model": self._rag_module.LLM_MODEL if hasattr(self._rag_module, 'LLM_MODEL') else "unknown"
            }
        except Exception as e:
            return {
                "ready": False,
                "error": str(e)
            }

# Singleton instance
rag_service = RAGService()
