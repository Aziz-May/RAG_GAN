import pytest
import sys
from pathlib import Path

# Add parent directory to path for app imports
sys.path.insert(0, str(Path(__file__).parent.parent))

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
