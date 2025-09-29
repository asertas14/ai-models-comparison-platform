from fastapi import APIRouter, HTTPException
from app.summarization.models import SummarizationRequest, ComparisonResponse, SummarizationConfigResponse
from app.summarization.service import SummarizationService
from app.summarization.config import summarization_config
from app.llm.service import llm_service

router = APIRouter(prefix="/summarization", tags=["Summarization"])

# Crear instancia del servicio simplificado
summarization_service = SummarizationService()

@router.post("/compare", response_model=ComparisonResponse)
async def compare_summaries(request: SummarizationRequest):
    """
    Endpoint principal: compara resúmenes entre múltiples modelos.
    
    Este endpoint:
    1. Genera 5 resúmenes por cada modelo seleccionado
    2. Evalúa cada resumen usando un modelo evaluador
    3. Determina el mejor modelo basado en scores y consistencia
    4. Retorna comparación completa con métricas
    """
    try:
        result = await summarization_service.compare_models(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/config", response_model=SummarizationConfigResponse)
async def get_summarization_config():
    """Obtiene la configuración actual del módulo de resúmenes"""
    return SummarizationConfigResponse(
        samples_per_model=summarization_config.samples_per_model,
        default_max_words=summarization_config.default_max_words,
        evaluator_model=summarization_config.evaluator_model,
        prompt_template=summarization_config.summary_prompt_template
    )

@router.get("/models")
async def get_available_models_for_summarization():
    """Obtiene modelos disponibles para resúmenes"""
    return {
        "available_models": await llm_service.get_available_models(),
        "available_providers": llm_service.get_available_providers(),
        "evaluator_model": summarization_config.evaluator_model,
        "samples_per_model": summarization_config.samples_per_model
    }

@router.post("/test")
async def test_single_summary(
    text: str,
    model: str,
    max_words: int = 100,
    temperature: float = 0.7
):
    """Prueba rápida de un resumen con un solo modelo"""
    try:
        # Configuración simple para prueba
        llm_config = {
            "temperature": temperature,
            "max_tokens": max_words * 2,  # Aproximadamente 2 tokens por palabra
            "top_p": 1.0,
            "top_k": 50,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
            "stream": False
        }
        
        # Crear prompt de resumen
        prompt = summarization_config.summary_prompt_template.format(
            max_words=max_words,
            text=text
        )
        
        # Generar resumen usando interface LLM
        summary = await llm_service.generate_text(
            prompt=prompt,
            model=model,
            config=llm_config
        )
        
        return {
            "original_text": text,
            "model": model,
            "summary": summary,
            "word_count": len(summary.split()),
            "config_used": llm_config
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
