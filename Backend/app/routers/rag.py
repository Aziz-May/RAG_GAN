"""RAG (Retrieval-Augmented Generation) endpoints for parenting guidance.

Provides question-answering based on indexed parenting articles and resources.
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.rag import rag_service

router = APIRouter()


class RAGQuery(BaseModel):
    """Request body for RAG queries."""
    question: str = Field(..., min_length=5, max_length=500, description="The parenting question to answer")
    top_k: Optional[int] = Field(None, ge=1, le=10, description="Number of relevant sources to retrieve (1-10)")


class SourceChunk(BaseModel):
    """A retrieved source chunk."""
    id: str
    text: str
    source: str


class RAGResponse(BaseModel):
    """Response from RAG query."""
    question: str
    answer: str
    chunks: List[SourceChunk]
    prompt: Optional[str] = None
    error: Optional[str] = None


class RAGStatus(BaseModel):
    """RAG service status."""
    ready: bool
    collection: Optional[str] = None
    document_count: Optional[int] = None
    chroma_dir: Optional[str] = None
    model: Optional[str] = None
    message: Optional[str] = None
    error: Optional[str] = None


@router.post("/query", response_model=RAGResponse, summary="Ask a parenting question")
async def query_rag(query: RAGQuery) -> RAGResponse:
    """
    Query the RAG system with a parenting question.
    
    The system will:
    1. Retrieve relevant passages from indexed parenting articles
    2. Generate a comprehensive answer using an LLM
    3. Return the answer along with source references
    
    **Example questions:**
    - "How can I support my child's emotional development?"
    - "What are effective strategies for managing toddler tantrums?"
    - "How do I talk to my teenager about difficult topics?"
    """
    result = await rag_service.query(query.question, query.top_k)
    
    return RAGResponse(
        question=result["question"],
        answer=result["answer"],
        chunks=[
            SourceChunk(
                id=chunk["id"],
                text=chunk["text"],
                source=chunk["source"]
            )
            for chunk in result.get("chunks", [])
        ],
        prompt=result.get("prompt"),
        error=result.get("error")
    )


@router.get("/query", response_model=RAGResponse, summary="Ask a parenting question (GET)")
async def query_rag_get(
    question: str = Query(..., min_length=5, max_length=500, description="The parenting question to answer"),
    top_k: Optional[int] = Query(None, ge=1, le=10, description="Number of relevant sources to retrieve")
) -> RAGResponse:
    """
    Query the RAG system using GET request (convenient for simple queries).
    
    Same functionality as POST /query but accessible via URL parameters.
    """
    result = await rag_service.query(question, top_k)
    
    return RAGResponse(
        question=result["question"],
        answer=result["answer"],
        chunks=[
            SourceChunk(
                id=chunk["id"],
                text=chunk["text"],
                source=chunk["source"]
            )
            for chunk in result.get("chunks", [])
        ],
        prompt=result.get("prompt"),
        error=result.get("error")
    )


@router.get("/status", response_model=RAGStatus, summary="Get RAG service status")
async def get_rag_status() -> RAGStatus:
    """
    Get the current status of the RAG service.
    
    Returns information about:
    - Whether the service is ready
    - Vector database collection details
    - Number of indexed documents
    - LLM model being used
    
    Useful for health checks and debugging.
    """
    status = rag_service.get_status()
    return RAGStatus(**status)


@router.get("/health", summary="Quick health check")
async def health_check() -> Dict[str, Any]:
    """Quick health check endpoint for the RAG service."""
    return {
        "service": "rag",
        "ready": rag_service.ready,
        "status": "ok" if rag_service.ready else "unavailable"
    }
