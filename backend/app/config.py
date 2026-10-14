from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[1] / '.env',
        env_file_encoding='utf-8', extra='ignore',
    )
    ai_mode: Literal['mock', 'dashscope', 'deepseek'] = 'mock'
    dashscope_api_key: SecretStr = SecretStr('')
    deepseek_api_key: SecretStr = SecretStr('')
    ai_model: str = Field(default='qwen-plus', min_length=1, max_length=100)
    ai_timeout_seconds: float = Field(default=45, ge=1, le=90)
    ai_max_output_tokens: int = Field(default=4096, ge=512, le=6000)
    analysis_requests_per_minute: int = Field(default=6, ge=1, le=60)

    @property
    def configured(self) -> bool:
        if self.ai_mode == 'mock':
            return True
        key = self.deepseek_api_key if self.ai_mode == 'deepseek' else self.dashscope_api_key
        return bool(key.get_secret_value().strip())
