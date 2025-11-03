import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="session")
def client():
    """
    Create a single TestClient for the whole test session.
    This client will handle the lifespan events (startup/shutdown) of the app.
    """
    with TestClient(app) as c:
        yield c
