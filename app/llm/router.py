from fastapi import APIRouter, HTTPException
from app.llm.models import LLMRequestConfig, LLMConfigResponse
from app.llm.config import llm_config
from app.llm.service import llm_service

router = APIRouter(prefix="/llm", tags=["LLM"])

@router.get("/config", response_model=LLMConfigResponse)
async def get_llm_config():
    """Obtiene la configuración actual de LLM"""
    return LLMConfigResponse(
        current_config=LLMRequestConfig(),  # Configuración por defecto
        available_providers=llm_service.get_available_providers(),
        available_models=await llm_service.get_available_models(),
        internal_config={
            "max_concurrent_requests": llm_config.max_concurrent_requests,
            "retry_on_rate_limit": llm_config.retry_on_rate_limit,
            "retry_on_timeout": llm_config.retry_on_timeout,
            "exponential_backoff": llm_config.exponential_backoff
        }
    )

@router.post("/config")
async def update_llm_config(config: LLMRequestConfig):
    """Actualiza la configuración de LLM"""
    return {"message": "Configuración LLM actualizada", "config": config}

@router.get("/models")
async def get_available_models():
    """Obtiene lista de modelos disponibles"""
    return {
        "available_models": await llm_service.get_available_models(),
        "available_providers": llm_service.get_available_providers()
    }

@router.post("/test/{model}")
async def test_model(model: str, config: LLMRequestConfig):
    """Prueba un modelo específico con texto de ejemplo"""
    test_prompt = "Responde brevemente: ¿Qué es la inteligencia artificial?"
    
    try:
        result = await llm_service.generate_text(
            prompt=test_prompt,
            model=model,
            config=config.model_dump()
        )
        return {
            "model": model,
            "test_prompt": test_prompt,
            "response": result,
            "config_used": config
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
