from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging

logger = logging.getLogger("tutore")


def add_common_middlewares(app: FastAPI):
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Simple request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        logger.info(f"{request.method} {request.url}")
        response = await call_next(request)
        logger.info(f"Completed {response.status_code} for {request.url}")
        return response
