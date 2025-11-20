"""Quick test script for RAG service."""
import asyncio
from app.services.rag import rag_service

async def test_rag():
    print("=" * 60)
    print("RAG SERVICE TEST")
    print("=" * 60)
    
    # Test 1: Check status
    print("\n1. Checking RAG service status...")
    status = rag_service.get_status()
    print(f"   Ready: {status['ready']}")
    if status['ready']:
        print(f"   Collection: {status.get('collection')}")
        print(f"   Documents: {status.get('document_count')}")
        print(f"   Model: {status.get('model')}")
    else:
        print(f"   Error: {status.get('error', 'Unknown')}")
        print(f"   Message: {status.get('message', 'N/A')}")
    
    # Test 2: Query
    print("\n2. Testing RAG query...")
    question = "How can I support my child's emotional development?"
    print(f"   Question: {question}")
    
    result = await rag_service.query(question, top_k=3)
    print(f"   Answer length: {len(result['answer'])} chars")
    print(f"   Sources used: {len(result.get('chunks', []))}")
    print(f"\n   Answer preview:\n   {result['answer'][:300]}...")
    
    if result.get('chunks'):
        print(f"\n   Sources:")
        for i, chunk in enumerate(result['chunks'][:3], 1):
            print(f"     {i}. {chunk['source']} (ID: {chunk['id']})")
    
    # Test 3: Error handling
    print("\n3. Testing with empty question...")
    result_empty = await rag_service.query("", top_k=1)
    if result_empty.get('error'):
        print(f"   ✓ Error handled correctly: {result_empty['error'][:100]}")
    else:
        print(f"   Response: {result_empty['answer'][:100]}")
    
    print("\n" + "=" * 60)
    print("✓ RAG SERVICE TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_rag())
