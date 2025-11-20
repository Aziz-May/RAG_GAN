from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path 
import os

class Settings(BaseSettings):
    gemini_api_key: str | None = None
    freepik_api_key: str | None = None
    ai_provider: str | None = None
    openrouter_api_key: str | None = None
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    MONGO_URL: str = "mongodb://localhost:27017/tutore_dev"
    OPENROUTER_API_KEY: str  # This will be loaded from your .env
    model_config = SettingsConfigDict(env_file=".env")
    ROOT_DIR: Path = Path(__file__).parent.parent.parent
    DATA_DIR: Path = Path(f"{ROOT_DIR}/rag_assets/data")
    CSV_PATH: Path = Path(f"{ROOT_DIR}/rag_assets/parenting_articles.csv")
    CHROMA_DIR: Path = Path(os.getenv("CHROMA_DIR", str(ROOT_DIR / "rag_assets/chroma_db")))
    CHROMA_COLLECTION: str = "parenting_articles"

    # Embedding model (HF SentenceTransformer)
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    MAX_DOCS: int | None = None

    # Text split parameters
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 100

    # LLM model
    LLM_MODEL: str = "tngtech/deepseek-r1t2-chimera:free"

    # Retrieval
    DEFAULT_TOP_K: int = 3

    # Prompt template
    PROMPT_TEMPLATE: str = (
        "You are a parenting assistant expert. Use ONLY the provided sources to answer the question.\n"
        "If uncertain or information not found, say so clearly.\n\n"
        "Question: {question}\n\nSources:\n{sources}\n\nAnswer:"
    )

    # Timeouts
    HTTP_TIMEOUT: int = 60
    

settings = Settings()
