from typing import List, Dict, Any
import asyncio
import time
from app.summarization.config import summarization_config
from app.summarization.models import SummarizationRequest, ComparisonResponse, ModelSummaryResult
from app.summarization.evaluator import SummarizationEvaluator
from app.llm.service import llm_service

class SummarizationService:
    """
    Servicio principal de resúmenes.
    Import directo del módulo LLM - más simple.
    AQUÍ SÍ va la lógica específica de resúmenes.
    """
    
    def __init__(self):
        self.config = summarization_config
        self.llm_service = llm_service  # Import directo - más simple
    
    async def compare_models(self, request: SummarizationRequest) -> ComparisonResponse:
        """
        Función principal: compara múltiples modelos generando resúmenes.
        """
        start_time = time.time()
        
        # 1. Generar resúmenes con cada modelo
        results = []
        for model in request.models:
            print(f"🔄 Generando resúmenes con modelo: {model}")
            model_result = await self._generate_model_summaries(
                request.text, model, request.max_words, request.llm_config
            )
            results.append(model_result)
            print(f"✅ Modelo {model}: {model_result.success_count}/{self.config.samples_per_model} resúmenes generados")
        
        # 2. Evaluar resúmenes usando evaluador simplificado
        evaluations = []
        evaluator = SummarizationEvaluator()  # Crear evaluador
        
        for result in results:
            if result.summaries:  # Solo evaluar si hay resúmenes
                print(f"🧪 Evaluando resúmenes del modelo: {result.model}")
                evaluation = await evaluator.evaluate_summaries(
                    request.text, result.summaries, result.model
                )
                evaluations.append(evaluation)
        
        # 3. Determinar ganador
        winner = evaluator.get_best_model(evaluations)
        best_summary = self._get_best_summary(results, winner)
        
        execution_time = time.time() - start_time
        
        return ComparisonResponse(
            original_text=request.text,
            results=results,
            evaluations=evaluations,
            winner=winner or "ninguno",
            best_summary=best_summary,
            total_execution_time=execution_time,
            models_tested=len(request.models),
            successful_evaluations=len(evaluations)
        )
    
    async def _generate_model_summaries(self, 
                                       text: str, 
                                       model: str, 
                                       max_words: int,
                                       llm_config: Dict[str, Any]) -> ModelSummaryResult:
        """
        Genera múltiples resúmenes con un modelo específico.
        AQUÍ SÍ va esta lógica porque es específica de resúmenes.
        """
        start_time = time.time()
        summaries = []
        successful_summaries = 0
        
        for i in range(self.config.samples_per_model):
            try:
                # Crear prompt específico de resumen
                prompt = self.config.summary_prompt_template.format(
                    max_words=max_words,
                    text=text
                )
                
                # Usar LLM service directo para generar texto
                summary = await self.llm_service.generate_text(
                    prompt=prompt,
                    model=model,
                    config=llm_config
                )
                
                summaries.append(summary)
                successful_summaries += 1
                
            except Exception as e:
                print(f"Error generando resumen {i+1} con modelo {model}: {e}")
                summaries.append(f"Error: No se pudo generar resumen {i+1}")
        
        # Calcular estadísticas
        execution_time = time.time() - start_time
        avg_length = self._calculate_average_length(summaries)
        
        return ModelSummaryResult(
            model=model,
            summaries=summaries,
            avg_length=avg_length,
            execution_time=execution_time,
            success_count=successful_summaries
        )
    
    def _calculate_average_length(self, summaries: List[str]) -> float:
        """Calcula la longitud promedio de los resúmenes en palabras"""
        if not summaries:
            return 0.0
        
        total_words = 0
        valid_summaries = 0
        
        for summary in summaries:
            if not summary.startswith("Error:"):
                words = len(summary.split())
                total_words += words
                valid_summaries += 1
        
        return total_words / valid_summaries if valid_summaries > 0 else 0.0
    
    def _get_best_summary(self, results: List[ModelSummaryResult], winner: str) -> str:
        """Obtiene el mejor resumen del modelo ganador"""
        if not winner or winner == "ninguno":
            # Buscar cualquier resumen válido de cualquier modelo exitoso
            for result in results:
                if result.success_count > 0 and result.summaries:
                    for summary in result.summaries:
                        if not summary.startswith("Error:"):
                            return summary
            return "No se pudo generar ningún resumen válido"
        
        # Buscar resumen del modelo ganador
        for result in results:
            if result.model == winner and result.success_count > 0 and result.summaries:
                # Retornar el primer resumen válido del modelo ganador
                for summary in result.summaries:
                    if not summary.startswith("Error:"):
                        return summary
        
        # Si el modelo ganador no tiene resúmenes válidos, buscar en otros modelos exitosos
        for result in results:
            if result.success_count > 0 and result.summaries:
                for summary in result.summaries:
                    if not summary.startswith("Error:"):
                        return summary
        
        return "No se pudo obtener el mejor resumen"
    
    async def compare_models_simple(self, text: str, models: List[str], max_words: int = 100, llm_config: Dict[str, Any] = None) -> ComparisonResponse:
        """
        Método de conveniencia para comparar modelos con parámetros simples.
        """
        # Crear request object
        request = SummarizationRequest(
            text=text,
            models=models,
            max_words=max_words,
            llm_config=llm_config or {}
        )
        
        return await self.compare_models(request)

# Crear instancia global
summarization_service = SummarizationService()