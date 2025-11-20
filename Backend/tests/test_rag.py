"""Integration test for RAG endpoints."""
import pytest
import sys
from pathlib import Path

# Add parent directory to path for app imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_rag_status():
    """Test RAG status endpoint."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/rag/status")
        assert response.status_code == 200
        data = response.json()
        assert "ready" in data
        print(f"RAG Status: {data}")

@pytest.mark.asyncio
async def test_rag_health():
    """Test RAG health check endpoint."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/rag/health")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "rag"
        assert "ready" in data
        print(f"RAG Health: {data}")

@pytest.mark.asyncio
async def test_rag_query_post():
    """Test RAG query endpoint with POST."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/rag/query",
            json={
                "question": "How can I help my child with anxiety?",
                "top_k": 2
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "question" in data
        assert "answer" in data
        assert "chunks" in data
        assert len(data["chunks"]) <= 2
        print(f"RAG Answer length: {len(data['answer'])} chars")
        print(f"Sources used: {len(data['chunks'])}")

@pytest.mark.asyncio
async def test_rag_query_get():
    """Test RAG query endpoint with GET."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(
            "/rag/query?question=What are good bedtime routines?&top_k=3"
        )
        assert response.status_code == 200
        data = response.json()
        assert "question" in data
        assert "answer" in data
        assert "chunks" in data
        print(f"RAG GET query works: {len(data['answer'])} chars")

@pytest.mark.asyncio
async def test_rag_query_validation():
    """Test RAG query validation."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Test with too short question
        response = await client.post(
            "/rag/query",
            json={"question": "Hi"}
        )
        assert response.status_code == 422  # Validation error
        
        # Test with missing question
        response = await client.post("/rag/query", json={})
        assert response.status_code == 422

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
