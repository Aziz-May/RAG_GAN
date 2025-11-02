import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.mark.order(1)
def test_root():
    resp = client.get('/')
    assert resp.status_code == 200
    assert resp.json().get('status') == 'ok'

@pytest.mark.order(2)
def test_signup_and_login():
    # Sign up a new user
    payload = {
        "name": "Test User",
        "email": "testuser@example.com",
        "password": "password123",
        "role": "client"
    }
    resp = client.post('/auth/signup', json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data['email'] == payload['email']

    # Login
    resp2 = client.post('/auth/login', json=payload)
    assert resp2.status_code == 200
    token = resp2.json().get('access_token')
    assert token
