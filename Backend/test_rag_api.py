"""
Manual test script for RAG endpoints via HTTP.
Run with uvicorn server active on port 8000.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_rag_health():
    """Test RAG health endpoint."""
    print("\n" + "="*60)
    print("Testing RAG Health Endpoint")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/rag/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_rag_status():
    """Test RAG status endpoint."""
    print("\n" + "="*60)
    print("Testing RAG Status Endpoint")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/rag/status")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_rag_query_post():
    """Test RAG query endpoint with POST."""
    print("\n" + "="*60)
    print("Testing RAG Query (POST)")
    print("="*60)
    
    question = "How can I support my child's emotional development?"
    payload = {
        "question": question,
        "top_k": 3
    }
    
    print(f"Question: {question}")
    print(f"Top K: 3")
    
    response = requests.post(
        f"{BASE_URL}/rag/query",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nAnswer ({len(data['answer'])} chars):")
        print("-" * 60)
        print(data['answer'][:500] + "..." if len(data['answer']) > 500 else data['answer'])
        print("-" * 60)
        
        print(f"\nSources Used ({len(data['chunks'])} chunks):")
        for i, chunk in enumerate(data['chunks'], 1):
            print(f"  {i}. {chunk['source']}")
            print(f"     ID: {chunk['id']}")
            print(f"     Text: {chunk['text'][:100]}...")
            print()
        
        if data.get('error'):
            print(f"⚠ Error: {data['error']}")
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def test_rag_query_get():
    """Test RAG query endpoint with GET."""
    print("\n" + "="*60)
    print("Testing RAG Query (GET)")
    print("="*60)
    
    question = "What are good bedtime routines?"
    params = {
        "question": question,
        "top_k": 2
    }
    
    print(f"Question: {question}")
    
    response = requests.get(f"{BASE_URL}/rag/query", params=params)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nAnswer: {data['answer'][:300]}...")
        print(f"Sources: {len(data['chunks'])}")
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def test_validation():
    """Test input validation."""
    print("\n" + "="*60)
    print("Testing Input Validation")
    print("="*60)
    
    # Test with too short question
    print("\n1. Testing with short question (should fail)...")
    response = requests.post(
        f"{BASE_URL}/rag/query",
        json={"question": "Hi"}
    )
    print(f"   Status Code: {response.status_code} (expected 422)")
    print(f"   ✓ Validation working" if response.status_code == 422 else "   ✗ Validation not working")
    
    # Test with missing question
    print("\n2. Testing with missing question (should fail)...")
    response = requests.post(f"{BASE_URL}/rag/query", json={})
    print(f"   Status Code: {response.status_code} (expected 422)")
    print(f"   ✓ Validation working" if response.status_code == 422 else "   ✗ Validation not working")
    
    # Test with valid question
    print("\n3. Testing with valid question (should pass)...")
    response = requests.post(
        f"{BASE_URL}/rag/query",
        json={"question": "How do I handle tantrums?"}
    )
    print(f"   Status Code: {response.status_code} (expected 200)")
    print(f"   ✓ Valid request accepted" if response.status_code == 200 else "   ✗ Valid request failed")

def main():
    """Run all tests."""
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*15 + "RAG API MANUAL TESTS" + " "*23 + "║")
    print("╚" + "="*58 + "╝")
    
    try:
        tests = [
            ("Health Check", test_rag_health),
            ("Status Check", test_rag_status),
            ("Query (POST)", test_rag_query_post),
            ("Query (GET)", test_rag_query_get),
            ("Validation", test_validation),
        ]
        
        results = []
        for name, test_func in tests:
            try:
                success = test_func()
                results.append((name, success))
            except requests.exceptions.ConnectionError:
                print(f"\n❌ Connection Error: Is the server running on {BASE_URL}?")
                print("   Start with: uvicorn app.main:app --reload --port 8000")
                return
            except Exception as e:
                print(f"\n❌ Error in {name}: {e}")
                results.append((name, False))
        
        # Summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        for name, success in results:
            status = "✓ PASS" if success else "✗ FAIL"
            print(f"{status} - {name}")
        
        passed = sum(1 for _, success in results if success)
        total = len(results)
        print(f"\nTotal: {passed}/{total} tests passed")
        
        if passed == total:
            print("\n🎉 All tests passed!")
        else:
            print(f"\n⚠ {total - passed} test(s) failed")
        
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")

if __name__ == "__main__":
    main()
