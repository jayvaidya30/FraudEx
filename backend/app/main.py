from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings


def create_app() -> FastAPI:
    application = FastAPI(title="FraudEx Backend")

    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    if settings.environment != "prod":
        application.add_middleware(
            CORSMiddleware,
            allow_origins=allowed_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    application.include_router(api_router)
    return application


app = create_app()
