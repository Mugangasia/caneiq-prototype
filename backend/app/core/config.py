from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "development"

    database_url: str = "postgresql+psycopg://caneiq:caneiq@localhost:5432/caneiq"
    database_url_sync: str = "postgresql+psycopg://caneiq:caneiq@localhost:5432/caneiq"

    redis_url: str = "redis://localhost:6379/0"

    cors_origins: str = "http://localhost:3000"

    s3_endpoint_url: str = "http://localhost:9000"
    s3_bucket: str = "caneiq-media"
    s3_access_key: str = ""
    s3_secret_key: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
