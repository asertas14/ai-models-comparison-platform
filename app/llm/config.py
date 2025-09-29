from typing import List
from app.config import get_available_providers

class LLMConfig:
    """
    Configuración INTERNA del módulo LLM.
    Solo configuración técnica, NO modelos hardcodeados.
    """
    
    def __init__(self):
        # ===== CONFIGURACIÓN TÉCNICA INTERNA =====
        self.max_concurrent_requests = 5
        self.request_timeout = 60
        self.retry_on_rate_limit = True
        self.retry_on_timeout = True
        self.exponential_backoff = True
        
        # ===== CONFIGURACIÓN POR DEFECTO INTERNA =====
        self.default_temperature = 0.7
        self.default_max_tokens = 1000
        self.default_top_p = 1.0
        self.default_top_k = 50
        self.default_frequency_penalty = 0.0
        self.default_presence_penalty = 0.0
        self.default_stream = False
    
    def get_available_providers(self) -> List[str]:
        """Retorna proveedores disponibles usando configuración global"""
        return get_available_providers()

# Instancia global
llm_config = LLMConfig()