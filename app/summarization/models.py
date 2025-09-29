from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SummarizationRequest(BaseModel):
    """Request para comparar resúmenes entre múltiples modelos"""
    text: str = Field(..., min_length=100, max_length=10000)
    models: List[str] = Field(..., min_items=2, max_items=5)
    max_words: int = Field(100, ge=20, le=500)
    llm_config: Dict[str, Any]  # Configuración LLM del frontend

class ModelSummaryResult(BaseModel):
    """Resultado de resúmenes de un modelo específico"""
    model: str
    summaries: List[str]  # 3 resúmenes
    avg_length: float
    execution_time: float
    success_count: int  # Cuántos resúmenes se generaron exitosamente

class EvaluationScore(BaseModel):
    """Puntuación de evaluación de un modelo"""
    model: str
    similarity_scores: List[float]  # 3 scores totales (3-15)
    average_score: float  # Score promedio total
    best_score: float
    worst_score: float
    consistency_score: float  # Qué tan consistentes son los 3 resúmenes
    individual_summaries: List[str] = []  # Los 3 resúmenes originales
    evaluation_details: List[Dict[str, Any]] = []  # Detalles de precisión, completitud, claridad

class ComparisonResponse(BaseModel):
    """Response completa de comparación"""
    original_text: str
    results: List[ModelSummaryResult]
    evaluations: List[EvaluationScore]
    winner: str  # Modelo ganador
    best_summary: str
    total_execution_time: float
    models_tested: int
    successful_evaluations: int

class SummarizationConfigResponse(BaseModel):
    """Response de configuración del módulo"""
    samples_per_model: int
    default_max_words: int
    evaluator_model: str
    prompt_template: str
