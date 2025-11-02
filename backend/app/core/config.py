from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    MONGO_URL: str = "mongodb://localhost:27017/tutore_dev"

    class Config:
        env_file = ".env"

settings = Settings()
