from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
import os

class GlobalConfig(BaseSettings):
    """
    Configuración GLOBAL de la aplicación.
    Solo contiene configuración que afecta a toda la aplicación.
    """
    
    # ===== INFORMACIÓN DE LA APLICACIÓN =====
    app_name: str = "Multiple LLMs Summarizer"
    app_version: str = "1.0.0"
    
    # ===== CONFIGURACIÓN DEL SERVIDOR =====
    host: str = Field("0.0.0.0", env="HOST")
    port: int = Field(8000, env="PORT")
    debug: bool = Field(False, env="DEBUG")
    
    # ===== CONFIGURACIÓN DE LOGGING =====
    log_level: str = Field("INFO", env="LOG_LEVEL")
    
    # ===== API KEYS GLOBALES =====
    # Estas son las únicas configuraciones que necesitan estar aquí
    # porque las usan múltiples módulos
    openai_api_key: Optional[str] = Field(None, env="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(None, env="ANTHROPIC_API_KEY")
    google_api_key: Optional[str] = Field(None, env="GOOGLE_API_KEY")
    
    # ===== CONFIGURACIÓN GLOBAL DE REQUESTS =====
    # Timeouts y reintentos que aplican a todos los módulos
    request_timeout: int = 60  # segundos
    max_retries: int = 3
    retry_delay: float = 1.0
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# ===== INSTANCIA GLOBAL =====
settings = GlobalConfig()

# ===== FUNCIONES UTILITARIAS GLOBALES =====

def get_available_providers() -> list[str]:
    """
    Retorna lista de proveedores que tienen API key configurada.
    Esta función es global porque la usan múltiples módulos.
    """
    providers = []
    if settings.openai_api_key:
        providers.append("openai")
    if settings.anthropic_api_key:
        providers.append("anthropic")
    if settings.google_api_key:
        providers.append("google")
    return providers

def is_provider_available(provider: str) -> bool:
    """
    Verifica si un proveedor específico está disponible.
    Función global porque la usan múltiples módulos.
    """
    return provider in get_available_providers()

def get_api_key(provider: str) -> Optional[str]:
    """
    Retorna la API key de un proveedor específico.
    Función global para centralizar el acceso a API keys.
    """
    if provider == "openai":
        return settings.openai_api_key
    elif provider == "anthropic":
        return settings.anthropic_api_key
    elif provider == "google":
        return settings.google_api_key
    return None