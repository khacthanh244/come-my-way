from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    embedding_model: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    agent_endpoint_url: str = (
        "https://endpoint-bfc56232-36b6-4383-ac71-f3412143fbfe"
        ".agentbase-runtime.aiplatform.vngcloud.vn/invocations"
    )
    chroma_db_path: str = "./chroma_db"
    collection_name: str = "merchant_docs"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
