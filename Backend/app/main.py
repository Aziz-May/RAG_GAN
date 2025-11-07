from contextlib import asynccontextmanager
from fastapi import FastAPI
from .db.mongo import connect_to_mongo, close_mongo
from .routers import auth, client, consultant, messages
from .routers import ai
from .middleware import add_common_middlewares

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    await connect_to_mongo()
    yield
    await close_mongo()

app = FastAPI(title="Tutore API", lifespan=lifespan)

# Add CORS and other middlewares
add_common_middlewares(app)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(client.router, prefix="/client", tags=["client"])
app.include_router(consultant.router, prefix="/consultant", tags=["consultant"])
app.include_router(messages.router, prefix="/messages", tags=["messages"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])


@app.get("/")
async def root():
    return {"status": "ok", "service": "tutore-backend"}

