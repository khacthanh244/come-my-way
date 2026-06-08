from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    chroma_db_path: str = "./chroma_db"
    collection_name: str = "merchant_docs"

    class Config:
        env_file = ".env"


settings = Settings()
