from pydantic import BaseModel, Field
from typing import List, Dict, Any

class LLMRequestConfig(BaseModel):
    """Configuración de un request LLM desde el frontend"""
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    top_p: float = Field(1.0, ge=0.0, le=1.0)
    top_k: int = Field(50, ge=1, le=100)
    max_tokens: int = Field(1000, ge=1, le=4000)
    frequency_penalty: float = Field(0.0, ge=-2.0, le=2.0)
    presence_penalty: float = Field(0.0, ge=-2.0, le=2.0)
    stream: bool = False

class LLMConfigResponse(BaseModel):
    """Response de configuración LLM"""
    current_config: LLMRequestConfig
    available_providers: List[str]
    available_models: List[str]
    internal_config: Dict[str, Any]

class LLMResponse(BaseModel):
    """Response de una llamada LLM"""
    text: str
    model: str
    tokens_used: int
    execution_time: float