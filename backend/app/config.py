from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/app/config.py -> parents[2] = repo root (works no matter the cwd)
REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = REPO_ROOT / "data"
SHARED_DIR = REPO_ROOT / "shared"
FIXTURES_DIR = SHARED_DIR / "fixtures"
AGENTS_DOCS_DIR = REPO_ROOT / "docs" / "agents"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(REPO_ROOT / ".env", REPO_ROOT / "backend" / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    swarms_api_key: str = ""
    swarms_base_url: str = "https://api.swarms.world"
    swarms_timeout_s: float = 90.0

    model_career: str = "gpt-5.4-mini"
    model_pathway: str = "gpt-5.4-mini"
    model_cost: str = "gpt-5.4-mini"
    model_finaid: str = "gpt-5.4-mini"
    model_prodev: str = "gpt-5.4-mini"
    model_alternatives: str = "gpt-5.4-mini"
    model_aggregator: str = "gpt-5.4-mini"
    model_writer: str = "gpt-5.4-mini"
    model_navigator: str = "gpt-5.4-mini"

    max_tokens_chat: int = 300
    max_tokens_aggregator: int = 600
    max_tokens_writer: int = 4000
    max_tokens_navigator: int = 200

    demo_mode: bool = False
    cache_dir: str = ".cache"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def cache_path(self) -> Path:
        p = Path(self.cache_dir)
        return p if p.is_absolute() else REPO_ROOT / "backend" / p

    def model_for(self, agent_id: str) -> str:
        return getattr(self, f"model_{agent_id}", self.model_career)


@lru_cache
def get_settings() -> Settings:
    return Settings()
