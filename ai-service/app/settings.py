"""환경변수 — OPENAI_API_KEY 없으면 LLM 단계 생략(7~8단계 규칙만)."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str | None = None
    openai_timeout_seconds: float = 45.0


@lru_cache
def get_settings() -> Settings:
    return Settings()