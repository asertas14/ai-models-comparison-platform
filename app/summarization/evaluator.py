from typing import List, Dict, Any
import asyncio
import re
from app.summarization.config import summarization_config
from app.summarization.models import EvaluationScore
from app.llm.service import llm_service

class SummarizationEvaluator:
    """
    Evaluador específico para resúmenes.
    Implementa evaluación por reconstrucción + bonus por compresión.
    """
    
    def __init__(self):
        self.config = summarization_config
        self.llm_service = llm_service  # Import directo - más simple
    
    async def evaluate_summaries(self, 
                                original_text: str, 
                                summaries: List[str], 
                                model_name: str) -> EvaluationScore:
        """
        NUEVO SISTEMA SIMPLE: Evalúa cada resumen en 3 áreas clave:
        1. PRECISIÓN (1-5): ¿Es correcto?
        2. COMPLETITUD (1-5): ¿Cubre todo lo importante?
        3. CLARIDAD (1-5): ¿Es fácil de entender?
        """
        # Filtrar resúmenes válidos (no errores)
        valid_summaries = [s for s in summaries if not s.startswith("Error:")]
        
        if not valid_summaries:
            return EvaluationScore(
                model=model_name,
                similarity_scores=[0.0],
                average_score=0.0,
                best_score=0.0,
                worst_score=0.0,
                consistency_score=0.0,
                evaluation_details=[]
            )
        
        try:
            # Evaluar cada resumen con el nuevo sistema
            evaluation_results = await self._evaluate_summaries_simple(
                original_text, valid_summaries, model_name
            )
            
            # Extraer scores y detalles
            total_scores = []
            evaluation_details = []
            
            for result in evaluation_results:
                total_score = result['precision'] + result['completeness'] + result['clarity']
                total_scores.append(total_score)
                evaluation_details.append(result)
            
            # Calcular métricas
            average_score = sum(total_scores) / len(total_scores) if total_scores else 0
            best_score = max(total_scores) if total_scores else 0
            worst_score = min(total_scores) if total_scores else 0
            consistency = self._calculate_consistency(total_scores)
            
            return EvaluationScore(
                model=model_name,
                similarity_scores=total_scores,  # Ahora son scores totales (3-15)
                average_score=average_score,
                best_score=best_score,
                worst_score=worst_score,
                consistency_score=consistency,
                individual_summaries=valid_summaries,
                evaluation_details=evaluation_details  # Detalles de la evaluación
            )
            
        except Exception as e:
            print(f"Error evaluando resúmenes de {model_name}: {e}")
            return EvaluationScore(
                model=model_name,
                similarity_scores=[0.0],
                average_score=0.0,
                best_score=0.0,
                worst_score=0.0,
                consistency_score=0.0,
                evaluation_details=[]
            )
    
    async def _evaluate_summaries_simple(self, original_text: str, summaries: List[str], model_name: str) -> List[Dict[str, Any]]:
        """
        NUEVO MÉTODO SIMPLE: Evalúa cada resumen en las 3 áreas clave usando el modelo evaluador.
        """
        try:
            # Crear prompt para evaluación simple
            summaries_text = "\n\n".join([f"RESUMEN {i+1}:\n{summary}" for i, summary in enumerate(summaries)])
            
            evaluation_prompt = f"""
# Evaluación Simple de Modelos de Resumen

## TEXTO ORIGINAL:
{original_text}

## RESÚMENES A EVALUAR:
{summaries_text}

## INSTRUCCIONES

Para cada resumen, evalúa estas **3 áreas clave**:

### 1. PRECISIÓN (¿Es correcto?)
- ¿Los datos y hechos son exactos?
- ¿Hay información inventada o incorrecta?
- ¿Los números/porcentajes coinciden con el original?

**Puntaje: 1-5** (5 = todo correcto, 1 = muchos errores)

### 2. COMPLETITUD (¿Cubre todo lo importante?)
- ¿Incluye los temas principales del texto original?
- ¿Falta alguna sección importante?
- ¿El balance entre temas es apropiado?

**Puntaje: 1-5** (5 = cubre todo, 1 = omite mucho)

### 3. CLARIDAD (¿Es fácil de entender?)
- ¿El texto fluye bien?
- ¿Las ideas están bien conectadas?
- ¿Es conciso sin perder información importante?

**Puntaje: 1-5** (5 = muy claro, 1 = confuso)

## FORMATO DE RESPUESTA

Para cada resumen, responde EXACTAMENTE en este formato:

RESUMEN 1:
PRECISIÓN: [1-5]
COMPLETITUD: [1-5] 
CLARIDAD: [1-5]
COMENTARIO: [1 línea explicando el problema principal o fortaleza]

RESUMEN 2:
PRECISIÓN: [1-5]
COMPLETITUD: [1-5]
CLARIDAD: [1-5] 
COMENTARIO: [1 línea explicando el problema principal o fortaleza]

RESUMEN 3:
PRECISIÓN: [1-5]
COMPLETITUD: [1-5]
CLARIDAD: [1-5]
COMENTARIO: [1 línea explicando el problema principal o fortaleza]
"""
            
            # Configuración para el modelo evaluador
            eval_config = {
                "temperature": 0.1,  # Más determinístico para evaluación
                "max_tokens": 1000,
                "top_p": 1.0,
                "top_k": 50,
                "frequency_penalty": 0.0,
                "presence_penalty": 0.0,
                "stream": False
            }
            
            # Generar evaluación usando el modelo evaluador
            evaluation_text = await self.llm_service.generate_text(
                prompt=evaluation_prompt,
                model=self.config.evaluator_model,
                config=eval_config
            )
            
            # Parsear la respuesta del evaluador
            parsed_results = self._parse_evaluation_response(evaluation_text, len(summaries))
            
            return parsed_results
            
        except Exception as e:
            print(f"Error en evaluación simple: {e}")
            # Retornar evaluación por defecto
            return [
                {
                    'precision': 3,
                    'completeness': 3,
                    'clarity': 3,
                    'comment': 'Error en evaluación'
                } for _ in summaries
            ]
    
    def _parse_evaluation_response(self, response: str, expected_count: int) -> List[Dict[str, Any]]:
        """
        Parsea la respuesta del evaluador y extrae los scores.
        """
        results = []
        
        try:
            import re
            
            # Buscar patrones para cada resumen
            pattern = r'RESUMEN\s+(\d+):\s*PRECISIÓN:\s*(\d+)\s*COMPLETITUD:\s*(\d+)\s*CLARIDAD:\s*(\d+)\s*COMENTARIO:\s*(.+?)(?=RESUMEN\s+\d+:|$)'
            matches = re.findall(pattern, response, re.DOTALL | re.IGNORECASE)
            
            for match in matches:
                try:
                    precision = int(match[1])
                    completeness = int(match[2])
                    clarity = int(match[3])
                    comment = match[4].strip()
                    
                    # Validar rangos
                    precision = max(1, min(5, precision))
                    completeness = max(1, min(5, completeness))
                    clarity = max(1, min(5, clarity))
                    
                    results.append({
                        'precision': precision,
                        'completeness': completeness,
                        'clarity': clarity,
                        'comment': comment
                    })
                except ValueError:
                    continue
            
            # Si no se parsearon suficientes resultados, completar con valores por defecto
            while len(results) < expected_count:
                results.append({
                    'precision': 3,
                    'completeness': 3,
                    'clarity': 3,
                    'comment': 'No se pudo evaluar correctamente'
                })
            
            return results[:expected_count]
            
        except Exception as e:
            print(f"Error parseando evaluación: {e}")
            return [
                {
                    'precision': 3,
                    'completeness': 3,
                    'clarity': 3,
                    'comment': 'Error en parseo'
                } for _ in range(expected_count)
            ]
    
    async def _generate_general_reconstruction(self, original: str, summaries: List[str]) -> str:
        """
        NUEVO MÉTODO: Genera una reconstrucción general basada en todos los resúmenes.
        El modelo evaluador intenta reconstruir el texto original usando todos los resúmenes como información.
        """
        try:
            # Crear prompt que incluya todos los resúmenes
            summaries_text = "\n\n".join([f"Resumen {i+1}: {summary}" for i, summary in enumerate(summaries)])
            
            reconstruction_prompt = f"""
            Tienes {len(summaries)} resúmenes del mismo texto original. 
            Usando TODA la información de estos resúmenes, reconstruye el texto original 
            con el mayor detalle y precisión posible. Mantén el mismo estilo y estructura.
            
            {summaries_text}
            
            Texto reconstruido:
            """
            
            # Configuración para el modelo evaluador
            eval_config = {
                "temperature": self.config.evaluation_temperature,
                "max_tokens": 1500,  # Suficiente para reconstrucción completa
                "top_p": 1.0,
                "top_k": 50,
                "frequency_penalty": 0.0,
                "presence_penalty": 0.0,
                "stream": False
            }
            
            # Generar reconstrucción usando el modelo evaluador
            reconstructed_text = await self.llm_service.generate_text(
                prompt=reconstruction_prompt,
                model=self.config.evaluator_model,
                config=eval_config
            )
            
            return reconstructed_text.strip()
            
        except Exception as e:
            print(f"Error en reconstrucción general: {e}")
            return ""
    
    async def _evaluate_multiple_summaries_together(self, original: str, summaries: List[str]) -> Dict[str, Any]:
        """
        NUEVO MÉTODO: Evalúa múltiples resúmenes juntos usando el modelo evaluador.
        El modelo evaluador recibe todos los resúmenes y los reconstruye uno por uno.
        """
        try:
            # Crear prompt que incluya todos los resúmenes
            summaries_text = "\n\n".join([f"Resumen {i+1}: {summary}" for i, summary in enumerate(summaries)])
            
            reconstruction_prompt = f"""
            Tienes {len(summaries)} resúmenes del mismo texto original. 
            Para cada resumen, intenta reconstruir el texto original con el mayor detalle posible.
            Mantén el mismo estilo y estructura del original.
            
            {summaries_text}
            
            Por favor, reconstruye el texto original para cada resumen, numerando las reconstrucciones:
            
            Reconstrucción 1:
            [Aquí la reconstrucción del primer resumen]
            
            Reconstrucción 2:
            [Aquí la reconstrucción del segundo resumen]
            
            [Y así sucesivamente...]
            """
            
            # Configuración para el modelo evaluador
            eval_config = {
                "temperature": self.config.evaluation_temperature,
                "max_tokens": 2000,  # Más tokens para múltiples reconstrucciones
                "top_p": 1.0,
                "top_k": 50,
                "frequency_penalty": 0.0,
                "presence_penalty": 0.0,
                "stream": False
            }
            
            # Generar reconstrucciones usando el modelo evaluador
            reconstructed_text = await self.llm_service.generate_text(
                prompt=reconstruction_prompt,
                model=self.config.evaluator_model,
                config=eval_config
            )
            
            # Extraer las reconstrucciones individuales
            reconstructions = self._extract_reconstructions(reconstructed_text, len(summaries))
            
            # Calcular similitud para cada reconstrucción
            scores = []
            for reconstruction in reconstructions:
                similarity = self._calculate_similarity(original, reconstruction)
                scores.append(similarity)
            
            return {
                'scores': scores,
                'reconstructions': reconstructions
            }
            
        except Exception as e:
            print(f"Error en evaluación múltiple: {e}")
            # Retornar scores de 0 para todos los resúmenes
        return {
                'scores': [0.0] * len(summaries),
                'reconstructions': [''] * len(summaries)
            }
    
    def _extract_reconstructions(self, text: str, expected_count: int) -> List[str]:
        """
        Extrae las reconstrucciones individuales del texto generado por el modelo.
        """
        reconstructions = []
        
        # Buscar patrones como "Reconstrucción 1:", "Reconstrucción 2:", etc.
        import re
        pattern = r'Reconstrucción\s+\d+:\s*(.*?)(?=Reconstrucción\s+\d+:|$)'
        matches = re.findall(pattern, text, re.DOTALL)
        
        for match in matches:
            # Limpiar el texto
            clean_text = match.strip()
            if clean_text and len(clean_text) > 10:  # Filtrar textos muy cortos
                reconstructions.append(clean_text)
        
        # Si no encontramos suficientes reconstrucciones, dividir por párrafos
        if len(reconstructions) < expected_count:
            paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
            reconstructions.extend(paragraphs[:expected_count - len(reconstructions)])
        
        # Asegurar que tenemos el número correcto de reconstrucciones
        while len(reconstructions) < expected_count:
            reconstructions.append("")
        
        return reconstructions[:expected_count]
    
    async def _evaluate_single_summary(self, original: str, summary: str) -> float:
        """
        Evalúa un resumen individual usando reconstrucción + bonus por compresión.
        """
        try:
            # 1. Intentar reconstruir texto original desde el resumen
            reconstruction_score = await self._evaluate_by_reconstruction(original, summary)
            
            # 2. Calcular bonus por compresión eficiente
            compression_bonus = self._calculate_compression_bonus(original, summary)
            
            # 3. Score final = reconstrucción + bonus por compresión
            final_score = reconstruction_score + compression_bonus
            
            return min(100.0, final_score)
            
        except Exception as e:
            print(f"Error evaluando resumen: {e}")
            return 0.0
    
    async def _evaluate_by_reconstruction(self, original: str, summary: str) -> float:
        """
        Evalúa un resumen intentando reconstruir el texto original.
        """
        try:
            # Prompt para reconstrucción
            reconstruction_prompt = f"""
            Basándote únicamente en este resumen, intenta reconstruir el texto original 
            con el mayor detalle posible. Mantén el mismo estilo y estructura:
            
            Resumen: {summary}
            
            Texto reconstruido:
            """
            
            # Configuración para el modelo evaluador
            eval_config = {
                "temperature": self.config.evaluation_temperature,
                "max_tokens": 1000,
                "top_p": 1.0,
                "top_k": 50,
                "frequency_penalty": 0.0,
                "presence_penalty": 0.0,
                "stream": False
            }
            
            # Generar reconstrucción usando LLM service
            reconstructed = await self.llm_service.generate_text(
                prompt=reconstruction_prompt,
                model=self.config.evaluator_model,
                config=eval_config
            )
            
            # Calcular similitud entre original y reconstruido
            similarity = self._calculate_similarity(original, reconstructed)
            
            return similarity
            
        except Exception as e:
            print(f"Error en reconstrucción: {e}")
            return 0.0
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """
        Calcula similitud entre textos usando SOLO similitud de palabras (Jaccard).
        Simplificado para centrarse únicamente en la reconstrucción.
        """
        if not text1 or not text2:
            return 0.0
        
        # Limpiar textos
        text1_clean = text1.lower().strip()
        text2_clean = text2.lower().strip()
        
        # Dividir en palabras y quitar palabras vacías comunes
        stop_words = {'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'del', 'los', 'las', 'una', 'como', 'pero', 'sus', 'le', 'ya', 'o', 'porque', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'donde', 'quien', 'desde', 'nos', 'durante', 'todos', 'uno', 'otro', 'esta', 'este', 'esta', 'estos', 'estas'}
        
        words1 = set(word for word in text1_clean.split() if word not in stop_words and len(word) > 2)
        words2 = set(word for word in text2_clean.split() if word not in stop_words and len(word) > 2)
        
        if not words1 or not words2:
            return 0.0
        
        # Similitud Jaccard pura
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        jaccard_similarity = intersection / union if union > 0 else 0
        
        return jaccard_similarity * 100  # Escala 0-100
    
    
    def _calculate_consistency(self, scores: List[float]) -> float:
        """
        Calcula qué tan consistentes son los scores (menor desviación = más consistente).
        """
        if len(scores) < 2:
            return 100.0
        
        # Calcular desviación estándar
        mean = sum(scores) / len(scores)
        variance = sum((x - mean) ** 2 for x in scores) / len(scores)
        std_dev = variance ** 0.5
        
        # Convertir a score de consistencia (0-100, donde 100 = muy consistente)
        # Asumiendo que desviación estándar de 0 = 100% consistente
        # y desviación estándar de 50 = 0% consistente
        consistency = max(0.0, 100.0 - (std_dev * 2))
        return consistency
    
    def get_best_model(self, evaluation_results: List[EvaluationScore]) -> str:
        """
        Determina el mejor modelo basado en el nuevo sistema simple.
        Usa el score promedio total (3-15) como criterio principal.
        """
        if not evaluation_results:
            return None
        
        best_model = None
        best_score = 0
        
        for result in evaluation_results:
            # En el nuevo sistema, el average_score es el score total promedio (3-15)
            if result.average_score > best_score:
                best_score = result.average_score
                best_model = result.model
        
        return best_model
    
    def generate_comparison_summary(self, evaluation_results: List[EvaluationScore]) -> str:
        """
        Genera un resumen de comparación al estilo del nuevo sistema.
        """
        if not evaluation_results:
            return "No hay evaluaciones disponibles"
        
        summary_parts = []
        
        for result in evaluation_results:
            # Calcular fortalezas
            avg_precision = sum(detail.get('precision', 0) for detail in result.evaluation_details) / len(result.evaluation_details) if result.evaluation_details else 0
            avg_completeness = sum(detail.get('completeness', 0) for detail in result.evaluation_details) / len(result.evaluation_details) if result.evaluation_details else 0
            avg_clarity = sum(detail.get('clarity', 0) for detail in result.evaluation_details) / len(result.evaluation_details) if result.evaluation_details else 0
            
            strongest_area = "Precisión" if avg_precision >= avg_completeness and avg_precision >= avg_clarity else \
                           "Completitud" if avg_completeness >= avg_clarity else "Claridad"
            
            # Problema más común
            common_issues = []
            if avg_precision < 3.5:
                common_issues.append("precisión de datos")
            if avg_completeness < 3.5:
                common_issues.append("información incompleta")
            if avg_clarity < 3.5:
                common_issues.append("claridad del texto")
            
            common_issue = ", ".join(common_issues) if common_issues else "ningún problema recurrente"
            
            summary_parts.append(f"""
MODELO {result.model.upper()}:
- Promedio: {result.average_score:.1f}/15
- Más fuerte en: {strongest_area}
- Problema recurrente: {common_issue}
            """.strip())
        
        # Determinar ganador
        best_model = self.get_best_model(evaluation_results)
        best_result = next((r for r in evaluation_results if r.model == best_model), None)
        
        if best_result:
            difference = best_result.average_score - min(r.average_score for r in evaluation_results if r.model != best_model)
            winner_section = f"""
GANADOR: {best_model} por {difference:.1f} puntos
RAZÓN: Mejor balance general en las tres áreas de evaluación
            """.strip()
        else:
            winner_section = "No se pudo determinar ganador"
        
        return "\n\n".join(summary_parts) + "\n\n" + winner_section

# Crear instancia global
summarization_evaluator = SummarizationEvaluator()