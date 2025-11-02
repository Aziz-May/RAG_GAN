from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db.mongo import connect_to_mongo, close_mongo, get_database
from .routers import auth, client, consultant, messages
from .middleware import add_common_middlewares

app = FastAPI(title="Tutore API")

# Add CORS and other middlewares
add_common_middlewares(app)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(client.router, prefix="/client", tags=["client"])
app.include_router(consultant.router, prefix="/consultant", tags=["consultant"])
app.include_router(messages.router, prefix="/messages", tags=["messages"])


@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo()


@app.get("/")
async def root():
    return {"status": "ok", "service": "tutore-backend"}
