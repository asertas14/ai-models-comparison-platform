from typing import List, Dict, Any
import asyncio
# Eliminamos LangChain, usamos clientes nativos directamente
from app.config import get_api_key
from app.llm.config import llm_config
from app.llm.models import LLMRequestConfig

class LLMService:
    """
    Servicio del módulo LLM.
    Proporciona métodos simples para generar texto con cualquier modelo.
    """
    
    def __init__(self):
        self.config = llm_config
    
    async def get_available_models(self) -> List[str]:
        """
        Llama a cada proveedor para obtener modelos disponibles.
        Implementación real con llamadas a APIs.
        """
        models = []
        available_providers = self.config.get_available_providers()
        
        # Llamadas reales a APIs de proveedores
        if "openai" in available_providers:
            try:
                import openai
                client = openai.AsyncClient(api_key=get_api_key("openai"))
                response = await client.models.list()
                openai_models = [model.id for model in response.data if 'gpt' in model.id.lower()]
                models.extend(openai_models)
            except Exception as e:
                print(f"Error obteniendo modelos OpenAI: {e}")
                # Fallback a modelos conocidos
                models.extend(["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo"])
        
        if "anthropic" in available_providers:
            try:
                # Anthropic no tiene API pública para listar modelos, usar modelos conocidos
                models.extend(["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"])
            except Exception as e:
                print(f"Error obteniendo modelos Anthropic: {e}")
        
        if "google" in available_providers:
            try:
                import google.generativeai as genai
                genai.configure(api_key=get_api_key("google"))
                google_models = []
                for model in genai.list_models():
                    if 'generateContent' in model.supported_generation_methods:
                        google_models.append(model.name.replace('models/', ''))
                models.extend(google_models)
            except Exception as e:
                print(f"Error obteniendo modelos Google: {e}")
                # Fallback a modelos conocidos
                models.extend(["gemini-pro", "gemini-pro-vision"])
        
        return models
    
    async def generate_text(self, prompt: str, model: str, config: Dict[str, Any]) -> str:
        """Genera texto usando un modelo específico - MÉTODO GENÉRICO"""
        # Validar configuración del frontend
        llm_request_config = LLMRequestConfig(**config)
        
        # Llamar directamente al modelo específico usando los clientes nativos
        if model.startswith("gpt"):
            return await self._call_openai_model(model, prompt, llm_request_config)
        elif model.startswith("claude"):
            return await self._call_anthropic_model(model, prompt, llm_request_config)
        elif model.startswith("gemini"):
            return await self._call_google_model(model, prompt, llm_request_config)
        else:
            raise ValueError(f"Modelo {model} no reconocido")
    
    async def _call_openai_model(self, model: str, prompt: str, config: LLMRequestConfig) -> str:
        """Llama directamente a OpenAI con el modelo específico"""
        try:
            import openai
            client = openai.AsyncClient(api_key=get_api_key("openai"))
            
            response = await client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=config.temperature,
                max_tokens=config.max_tokens,
                top_p=config.top_p,
                frequency_penalty=config.frequency_penalty,
                presence_penalty=config.presence_penalty,
                stream=config.stream
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise ValueError(f"Error llamando a OpenAI modelo {model}: {e}")
    
    async def _call_anthropic_model(self, model: str, prompt: str, config: LLMRequestConfig) -> str:
        """Llama directamente a Anthropic con el modelo específico"""
        try:
            import anthropic
            client = anthropic.AsyncAnthropic(api_key=get_api_key("anthropic"))
            
            response = await client.messages.create(
                model=model,
                max_tokens=config.max_tokens,
                temperature=config.temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response.content[0].text
        except Exception as e:
            raise ValueError(f"Error llamando a Anthropic modelo {model}: {e}")
    
    async def _call_google_model(self, model: str, prompt: str, config: LLMRequestConfig) -> str:
        """Llama directamente a Google con el modelo específico"""
        try:
            import google.generativeai as genai
            genai.configure(api_key=get_api_key("google"))
            
            # Verificar si el modelo existe
            available_models = [m.name.replace('models/', '') for m in genai.list_models()]
            if model not in available_models:
                # Intentar con modelos alternativos
                if model == "gemini-pro":
                    model = "gemini-1.5-flash"  # Modelo más reciente
                elif model == "gemini-pro-vision":
                    model = "gemini-1.5-flash"  # Modelo más reciente
                elif not any(m.startswith("gemini") for m in available_models):
                    raise ValueError(f"Modelo {model} no disponible. Modelos disponibles: {available_models}")
            
            model_instance = genai.GenerativeModel(model)
            
            generation_config = genai.types.GenerationConfig(
                temperature=config.temperature,
                max_output_tokens=config.max_tokens,
                top_p=config.top_p,
                top_k=config.top_k
            )
            
            response = await model_instance.generate_content_async(
                prompt,
                generation_config=generation_config
            )
            
            if not response.text:
                raise ValueError(f"Modelo {model} no generó contenido")
            
            return response.text
        except Exception as e:
            raise ValueError(f"Error llamando a Google modelo {model}: {e}")
    
    def get_available_providers(self) -> List[str]:
        """Retorna proveedores disponibles"""
        return self.config.get_available_providers()
    
    def _get_provider_from_model(self, model: str) -> str:
        """Determina el proveedor basado en el nombre del modelo"""
        if model.startswith("gpt"):
            return "openai"
        elif model.startswith("claude"):
            return "anthropic"
        elif model.startswith("gemini"):
            return "google"
        else:
            raise ValueError(f"Modelo {model} no reconocido")

# Instancia global
llm_service = LLMService()