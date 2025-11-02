from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from ..core.config import settings

_client: Optional[AsyncIOMotorClient] = None
_db = None

async def connect_to_mongo():
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGO_URL)
    # Use DB name from URL or default
    # motor exposes get_default_database when DB provided in URL
    try:
        _db = _client.get_default_database()
    except Exception:
        # fallback
        _db = _client.tutore_dev
    print("Connected to MongoDB")

async def close_mongo():
    global _client
    if _client:
        _client.close()
        print("Closed MongoDB connection")

def get_database():
    if _db is None:
        raise RuntimeError("Database not initialized")
    return _db
