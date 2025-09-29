from typing import List

class SummarizationConfig:
    """
    Configuración INTERNA del módulo Summarization.
    Solo configuración técnica específica del módulo.
    """
    
    def __init__(self):
        # ===== CONFIGURACIÓN TÉCNICA INTERNA =====
        self.samples_per_model = 3  # 3 resúmenes por modelo (reducido para costos)
        self.default_max_words = 100
        self.min_words = 20
        self.max_words_limit = 500
        
        # ===== CONFIGURACIÓN DEL EVALUADOR =====
        self.evaluator_model = "gpt-3.5-turbo"  # Modelo más barato para evaluar
        self.evaluation_temperature = 0.1
        self.evaluation_max_tokens = 10  # Solo necesitamos un número
        
        # ===== PROMPTS INTERNOS DEL MÓDULO =====
        self.summary_prompt_template = (
            "Resume el siguiente texto en exactamente {max_words} palabras. "
            "Mantén las ideas principales y el contexto más importante:\n\n{text}"
        )
        
        self.evaluation_prompt_template = (
            "Evalúa qué tan bien este resumen captura las ideas principales "
            "del texto original. Responde SOLO con un número del 0 al 100.\n\n"
            "Texto original: {original_text}\n\n"
            "Resumen: {summary}\n\n"
            "Puntuación (0-100):"
        )

# Instancia global
summarization_config = SummarizationConfig()