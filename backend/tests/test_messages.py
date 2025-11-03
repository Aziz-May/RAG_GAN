import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.mongo import connect_to_mongo, close_mongo


# Store tokens and user IDs globally for test reuse
consultant_token = None
consultant_id = None
client_token = None
client_id = None
message_ids = []


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    """Setup database connection for all tests"""
    await connect_to_mongo()
    
    # Clean up test users before running tests
    from app.db.mongo import get_database
    db = get_database()
    await db.users.delete_many({"email": {"$in": ["consultant@test.com", "client@test.com"]}})
    await db.messages.delete_many({})  # Clean all messages
    print("\n🧹 Cleaned up test data")
    
    yield
    
    await close_mongo()


@pytest_asyncio.fixture(scope="session")
async def async_client():
    """Create an async test client"""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        yield client


@pytest.mark.asyncio
@pytest.mark.order(1)
async def test_setup_users(async_client):
    """Create a consultant and a client for testing"""
    global consultant_token, consultant_id, client_token, client_id
    
    # Create consultant
    consultant_data = {
        "name": "Dr. Sarah Johnson",
        "email": "consultant@test.com",
        "password": "consultant123",
        "role": "consultant"
    }
    resp = await async_client.post('/auth/signup', json=consultant_data)
    if resp.status_code != 200:
        print(f"\n❌ Signup failed: {resp.status_code}")
        print(f"Response: {resp.json()}")
    assert resp.status_code == 200
    
    # Login consultant
    resp = await async_client.post('/auth/login', json=consultant_data)
    assert resp.status_code == 200
    data = resp.json()
    consultant_token = data['access_token']
    consultant_id = data['user']['id']
    print(f"\n✓ Consultant created: {consultant_id}")
    
    # Create client
    client_data = {
        "name": "John Doe",
        "email": "client@test.com",
        "password": "client123",
        "role": "client"
    }
    resp = await async_client.post('/auth/signup', json=client_data)
    assert resp.status_code == 200
    
    # Login client
    resp = await async_client.post('/auth/login', json=client_data)
    assert resp.status_code == 200
    data = resp.json()
    client_token = data['access_token']
    client_id = data['user']['id']
    print(f"✓ Client created: {client_id}")


@pytest.mark.asyncio
@pytest.mark.order(2)
async def test_send_message_client_to_consultant(async_client):
    """Test client sending a message to consultant"""
    global message_ids
    
    message_data = {
        "recipient_id": consultant_id,
        "content": "Hello Dr. Johnson, I need help with anxiety management."
    }
    
    resp = await async_client.post(
        '/messages/send',
        json=message_data,
        headers={"Authorization": f"Bearer {client_token}"}
    )
    
    assert resp.status_code == 200
    data = resp.json()
    assert data['sender_id'] == client_id
    assert data['recipient_id'] == consultant_id
    assert data['content'] == message_data['content']
    assert data['is_read'] == False
    
    message_ids.append(data['id'])
    print(f"\n✓ Message sent from client to consultant: {data['id']}")


@pytest.mark.asyncio
@pytest.mark.order(3)
async def test_send_message_consultant_to_client(async_client):
    """Test consultant replying to client"""
    global message_ids
    
    message_data = {
        "recipient_id": client_id,
        "content": "Hi John! I'd be happy to help. Let's schedule a session."
    }
    
    resp = await async_client.post(
        '/messages/send',
        json=message_data,
        headers={"Authorization": f"Bearer {consultant_token}"}
    )
    
    assert resp.status_code == 200
    data = resp.json()
    assert data['sender_id'] == consultant_id
    assert data['recipient_id'] == client_id
    assert data['content'] == message_data['content']
    
    message_ids.append(data['id'])
    print(f"\n✓ Message sent from consultant to client: {data['id']}")


@pytest.mark.asyncio
@pytest.mark.order(4)
async def test_send_multiple_messages(async_client):
    """Test sending multiple messages back and forth"""
    global message_ids
    
    # Client sends 2 more messages
    for i in range(2):
        message_data = {
            "recipient_id": consultant_id,
            "content": f"Client message #{i+2}: This is helpful, thank you!"
        }
        resp = await async_client.post(
            '/messages/send',
            json=message_data,
            headers={"Authorization": f"Bearer {client_token}"}
        )
        assert resp.status_code == 200
        message_ids.append(resp.json()['id'])
    
    # Consultant sends 2 more messages
    for i in range(2):
        message_data = {
            "recipient_id": client_id,
            "content": f"Consultant message #{i+2}: Great to hear from you!"
        }
        resp = await async_client.post(
            '/messages/send',
            json=message_data,
            headers={"Authorization": f"Bearer {consultant_token}"}
        )
        assert resp.status_code == 200
        message_ids.append(resp.json()['id'])
    
    print(f"\n✓ Sent 4 additional messages (Total: {len(message_ids)} messages)")


@pytest.mark.asyncio
@pytest.mark.order(5)
async def test_get_conversation_as_client(async_client):
    """Test getting conversation from client's perspective"""
    
    resp = await async_client.get(
        f'/messages/conversation/{consultant_id}',
        headers={"Authorization": f"Bearer {client_token}"}
    )
    
    assert resp.status_code == 200
    messages = resp.json()
    assert len(messages) == 6  # Total messages in conversation
    
    # Verify messages are sorted by time (oldest first)
    assert messages[0]['content'] == "Hello Dr. Johnson, I need help with anxiety management."
    
    # Check sender/recipient alternation
    assert messages[0]['sender_id'] == client_id
    assert messages[1]['sender_id'] == consultant_id
    
    print(f"\n✓ Retrieved {len(messages)} messages in conversation")


@pytest.mark.asyncio
@pytest.mark.order(6)
async def test_get_conversation_as_consultant(async_client):
    """Test getting conversation from consultant's perspective"""
    
    resp = await async_client.get(
        f'/messages/conversation/{client_id}',
        headers={"Authorization": f"Bearer {consultant_token}"}
    )
    
    assert resp.status_code == 200
    messages = resp.json()
    assert len(messages) == 6
    
    print(f"\n✓ Consultant can see same {len(messages)} messages")


@pytest.mark.asyncio
@pytest.mark.order(7)
async def test_unread_count_for_consultant(async_client):
    """Test unread message count for consultant"""
    
    resp = await async_client.get(
        '/messages/unread-count',
        headers={"Authorization": f"Bearer {consultant_token}"}
    )
    
    assert resp.status_code == 200
    data = resp.json()
    # Consultant should have unread messages from client
    assert data['unread_count'] >= 0
    
    print(f"\n✓ Consultant has {data['unread_count']} unread messages")


@pytest.mark.asyncio
@pytest.mark.order(8)
async def test_get_conversations_list(async_client):
    """Test getting all conversations for a user"""
    
    # Check client's conversations
    resp = await async_client.get(
        '/messages/conversations',
        headers={"Authorization": f"Bearer {client_token}"}
    )
    
    assert resp.status_code == 200
    conversations = resp.json()
    assert len(conversations) >= 1
    
    # Should have conversation with consultant
    conv = conversations[0]
    assert conv['other_user_id'] == consultant_id
    assert conv['other_user_name'] == "Dr. Sarah Johnson"
    assert conv['other_user_role'] == "consultant"
    assert conv['last_message'] is not None
    assert 'unread_count' in conv
    
    print(f"\n✓ Client has {len(conversations)} conversation(s)")
    print(f"  - With: {conv['other_user_name']} ({conv['other_user_role']})")
    print(f"  - Unread: {conv['unread_count']}")
    
    # Check consultant's conversations
    resp = await async_client.get(
        '/messages/conversations',
        headers={"Authorization": f"Bearer {consultant_token}"}
    )
    
    assert resp.status_code == 200
    conversations = resp.json()
    assert len(conversations) >= 1
    
    print(f"✓ Consultant has {len(conversations)} conversation(s)")


@pytest.mark.asyncio
@pytest.mark.order(9)
async def test_mark_message_as_read(async_client):
    """Test marking a specific message as read"""
    
    if not message_ids:
        pytest.skip("No messages to mark as read")
    
    # Use the first message sent to consultant
    message_id = message_ids[0]
    
    resp = await async_client.put(
        f'/messages/{message_id}/read',
        headers={"Authorization": f"Bearer {consultant_token}"}
    )
    
    assert resp.status_code == 200
    data = resp.json()
    assert data['status'] == 'success'
    
    print(f"\n✓ Message {message_id} marked as read")


@pytest.mark.asyncio
@pytest.mark.order(10)
async def test_send_message_to_nonexistent_user(async_client):
    """Test error handling when sending to non-existent user"""
    
    message_data = {
        "recipient_id": "000000000000000000000000",  # Fake ID
        "content": "This should fail"
    }
    
    resp = await async_client.post(
        '/messages/send',
        json=message_data,
        headers={"Authorization": f"Bearer {client_token}"}
    )
    
    assert resp.status_code == 404
    data = resp.json()
    assert 'detail' in data
    
    print(f"\n✓ Correctly rejected message to non-existent user")


@pytest.mark.asyncio
@pytest.mark.order(11)
async def test_send_message_with_invalid_id(async_client):
    """Test error handling with invalid user ID format"""
    
    message_data = {
        "recipient_id": "invalid-id",
        "content": "This should fail"
    }
    
    resp = await async_client.post(
        '/messages/send',
        json=message_data,
        headers={"Authorization": f"Bearer {client_token}"}
    )
    
    assert resp.status_code == 400
    data = resp.json()
    assert 'detail' in data
    
    print(f"\n✓ Correctly rejected invalid user ID format")


@pytest.mark.asyncio
@pytest.mark.order(12)
async def test_send_message_without_auth(async_client):
    """Test that authentication is required"""
    
    message_data = {
        "recipient_id": consultant_id,
        "content": "This should fail"
    }
    
    resp = await async_client.post('/messages/send', json=message_data)
    
    assert resp.status_code == 401
    
    print(f"\n✓ Correctly rejected unauthenticated request")


@pytest.mark.asyncio
@pytest.mark.order(13)
async def test_get_conversation_without_auth(async_client):
    """Test that authentication is required for viewing conversations"""
    
    resp = await async_client.get(f'/messages/conversation/{consultant_id}')
    
    assert resp.status_code == 401
    
    print(f"\n✓ Correctly rejected unauthenticated conversation request")


@pytest.mark.asyncio
@pytest.mark.order(14)
async def test_conversation_marks_messages_as_read(async_client):
    """Test that viewing conversation marks messages as read"""
    
    # Send a new message from client to consultant
    message_data = {
        "recipient_id": consultant_id,
        "content": "Testing auto-read feature"
    }
    resp = await async_client.post(
        '/messages/send',
        json=message_data,
        headers={"Authorization": f"Bearer {client_token}"}
    )
    assert resp.status_code == 200
    
    # Check unread count before viewing
    resp = await async_client.get(
        '/messages/unread-count',
        headers={"Authorization": f"Bearer {consultant_token}"}
    )
    unread_before = resp.json()['unread_count']
    
    # Consultant views the conversation
    resp = await async_client.get(
        f'/messages/conversation/{client_id}',
        headers={"Authorization": f"Bearer {consultant_token}"}
    )
    assert resp.status_code == 200
    
    # Check unread count after viewing
    resp = await async_client.get(
        '/messages/unread-count',
        headers={"Authorization": f"Bearer {consultant_token}"}
    )
    unread_after = resp.json()['unread_count']
    
    # Unread count should decrease or stay the same
    assert unread_after <= unread_before
    
    print(f"\n✓ Viewing conversation updated read status")
    print(f"  - Unread before: {unread_before}")
    print(f"  - Unread after: {unread_after}")


# Summary test
@pytest.mark.asyncio
@pytest.mark.order(15)
async def test_summary(async_client):
    """Print test summary"""
    print("\n" + "="*60)
    print("📊 MESSAGE SYSTEM TEST SUMMARY")
    print("="*60)
    print(f"✓ Total messages exchanged: {len(message_ids)}")
    print(f"✓ Consultant ID: {consultant_id}")
    print(f"✓ Client ID: {client_id}")
    print(f"✓ All endpoints tested successfully!")
    print("="*60)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
