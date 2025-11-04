import pytest
import time

# Store tokens and user IDs globally
consultant_token = None
consultant_id = None
client_token = None
client_id = None
message_ids = []


@pytest.fixture(scope="session", autouse=True)
def cleanup(client):
    """Clean up test data before running tests"""
    # The TestClient is now managed by conftest.py
    # It handles startup/shutdown for the whole session
    yield
    # Cleanup happens here if needed


@pytest.mark.order(1)
def test_setup_users(client):
    """Create a consultant and a client for testing"""
    global consultant_token, consultant_id, client_token, client_id
    
    # --- Consultant Setup ---
    consultant_email = f"consultant_test_{int(time.time() * 1000)}@test.com"
    consultant_password = "consultant123"
    consultant_data = {
        "name": "Dr. Sarah Johnson",
        "email": consultant_email,
        "password": consultant_password,
        "role": "consultant",
        "phone": "+10000000001"
    }
    
    # 1. Sign up consultant
    signup_resp = client.post('/auth/signup', json=consultant_data)
    assert signup_resp.status_code == 200, f"Failed to sign up consultant. Response: {signup_resp.json()}"
    consultant_id = signup_resp.json()['id']
    print(f"\n✓ Consultant signed up: {consultant_id}")

    # 2. Log in consultant
    login_resp = client.post('/auth/login', json={"email": consultant_email, "password": consultant_password})
    assert login_resp.status_code == 200, f"Failed to log in consultant. Response: {login_resp.json()}"
    consultant_token = login_resp.json()['access_token']
    print(f"✓ Consultant logged in successfully.")
    
    # --- Client Setup ---
    client_email = f"client_test_{int(time.time() * 1000)}@test.com"
    client_password = "client123"
    client_data = {
        "name": "John Doe",
        "email": client_email,
        "password": client_password,
        "role": "client",
        "phone": "+10000000002"
    }

    # 3. Sign up client
    signup_resp = client.post('/auth/signup', json=client_data)
    assert signup_resp.status_code == 200, f"Failed to sign up client. Response: {signup_resp.json()}"
    client_id = signup_resp.json()['id']
    print(f"✓ Client signed up: {client_id}")

    # 4. Log in client
    login_resp = client.post('/auth/login', json={"email": client_email, "password": client_password})
    assert login_resp.status_code == 200, f"Failed to log in client. Response: {login_resp.json()}"
    client_token = login_resp.json()['access_token']
    print(f"✓ Client logged in successfully.")


@pytest.mark.order(2)
def test_send_message_client_to_consultant(client):
    """Test client sending a message to consultant"""
    global message_ids
    
    message_data = {
        "recipient_id": consultant_id,
        "content": "Hello Dr. Johnson, I need help with anxiety management."
    }
    
    resp = client.post(
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


@pytest.mark.order(3)
def test_send_message_consultant_to_client(client):
    """Test consultant replying to client"""
    global message_ids
    
    message_data = {
        "recipient_id": client_id,
        "content": "Hi John! I'd be happy to help. Let's schedule a session."
    }
    
    resp = client.post(
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


@pytest.mark.order(4)
def test_send_multiple_messages(client):
    """Test sending multiple messages back and forth"""
    global message_ids
    
    # Client sends 2 more messages
    for i in range(2):
        message_data = {
            "recipient_id": consultant_id,
            "content": f"Client message #{i+2}: This is helpful, thank you!"
        }
        resp = client.post(
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
        resp = client.post(
            '/messages/send',
            json=message_data,
            headers={"Authorization": f"Bearer {consultant_token}"}
        )
        assert resp.status_code == 200
        message_ids.append(resp.json()['id'])
    
    print(f"\n✓ Sent 4 additional messages (Total: {len(message_ids)} messages)")


@pytest.mark.order(5)
def test_get_conversation_as_client(client):
    """Test getting conversation from client's perspective"""
    
    resp = client.get(
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


@pytest.mark.order(6)
def test_get_conversation_as_consultant(client):
    """Test getting conversation from consultant's perspective"""
    
    resp = client.get(
        f'/messages/conversation/{client_id}',
        headers={"Authorization": f"Bearer {consultant_token}"}
    )
    
    assert resp.status_code == 200
    messages = resp.json()
    assert len(messages) == 6
    
    print(f"\n✓ Consultant can see same {len(messages)} messages")


@pytest.mark.order(7)
def test_unread_count_for_consultant(client):
    """Test unread message count for consultant"""
    
    resp = client.get(
        '/messages/unread-count',
        headers={"Authorization": f"Bearer {consultant_token}"}
    )
    
    assert resp.status_code == 200
    data = resp.json()
    assert data['unread_count'] >= 0
    
    print(f"\n✓ Consultant has {data['unread_count']} unread messages")


@pytest.mark.order(8)
def test_get_conversations_list(client):
    """Test getting all conversations for a user"""
    
    # Check client's conversations
    resp = client.get(
        '/messages/conversations',
        headers={"Authorization": f"Bearer {client_token}"}
    )
    
    assert resp.status_code == 200
    conversations = resp.json()
    assert len(conversations) >= 1
    
    # Should have conversation with consultant
    conv = conversations[0]
    assert conv['other_user_id'] == consultant_id
    assert conv['last_message'] is not None
    assert 'unread_count' in conv
    
    print(f"\n✓ Client has {len(conversations)} conversation(s)")
    print(f"  - With: {conv['other_user_name']} ({conv['other_user_role']})")
    print(f"  - Unread: {conv['unread_count']}")
    
    # Check consultant's conversations
    resp = client.get(
        '/messages/conversations',
        headers={"Authorization": f"Bearer {consultant_token}"}
    )
    
    assert resp.status_code == 200
    conversations = resp.json()
    assert len(conversations) >= 1
    
    print(f"✓ Consultant has {len(conversations)} conversation(s)")


@pytest.mark.order(9)
def test_mark_message_as_read(client):
    """Test marking a specific message as read"""
    
    if not message_ids:
        pytest.skip("No messages to mark as read")
    
    # Use the first message sent to consultant
    message_id = message_ids[0]
    
    resp = client.put(
        f'/messages/{message_id}/read',
        headers={"Authorization": f"Bearer {consultant_token}"}
    )
    
    assert resp.status_code == 200
    data = resp.json()
    assert data['status'] == 'success'
    
    print(f"\n✓ Message {message_id} marked as read")


@pytest.mark.order(10)
def test_send_message_to_nonexistent_user(client):
    """Test error handling when sending to non-existent user"""
    
    message_data = {
        "recipient_id": "000000000000000000000000",  # Fake ID
        "content": "This should fail"
    }
    
    resp = client.post(
        '/messages/send',
        json=message_data,
        headers={"Authorization": f"Bearer {client_token}"}
    )
    
    assert resp.status_code == 404
    data = resp.json()
    assert 'detail' in data
    
    print(f"\n✓ Correctly rejected message to non-existent user")


@pytest.mark.order(11)
def test_send_message_with_invalid_id(client):
    """Test error handling with invalid user ID format"""
    
    message_data = {
        "recipient_id": "invalid-id",
        "content": "This should fail"
    }
    
    resp = client.post(
        '/messages/send',
        json=message_data,
        headers={"Authorization": f"Bearer {client_token}"}
    )
    
    assert resp.status_code == 400
    data = resp.json()
    assert 'detail' in data
    
    print(f"\n✓ Correctly rejected invalid user ID format")


@pytest.mark.order(12)
def test_send_message_without_auth(client):
    """Test that authentication is required"""
    
    message_data = {
        "recipient_id": consultant_id if consultant_id else "test",
        "content": "This should fail"
    }

    resp = client.post('/messages/send', json=message_data)
    
    assert resp.status_code == 401
    
    print(f"\n✓ Correctly rejected unauthenticated request")


@pytest.mark.order(13)
def test_get_conversation_without_auth(client):
    """Test that authentication is required for viewing conversations"""
    
    test_id = consultant_id if consultant_id else "673cb3ae42ef4f3a8e3c8b90"
    resp = client.get(f'/messages/conversation/{test_id}')
    
    assert resp.status_code == 401
    
    print(f"\n✓ Correctly rejected unauthenticated conversation request")


@pytest.mark.order(14)
def test_summary(client):
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
