/**
 * Core API Client - Cliente centralizado para todas las llamadas al backend
 * Maneja todas las comunicaciones con FastAPI de forma modular
 */
class APIClient {
    constructor() {
        this.baseURL = ''; // Sin prefijo, las rutas de FastAPI no tienen /api
        this.timeout = 300000; // 5 minutos para comparaciones largas
    }

    /**
     * Método genérico GET
     */
    async get(endpoint, params = {}) {
        try {
            const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error en GET ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Método genérico POST
     */
    async post(endpoint, data = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error en POST ${endpoint}:`, error);
            throw error;
        }
    }

    // ===== MÉTODOS ESPECÍFICOS POR MÓDULO =====

    /**
     * LLM Module - Obtener modelos disponibles
     */
    async getLLMModels() {
        return this.get('/llm/models');
    }

    /**
     * LLM Module - Obtener configuración
     */
    async getLLMConfig() {
        return this.get('/llm/config');
    }

    /**
     * LLM Module - Probar modelo
     */
    async testLLMModel(model, config) {
        return this.post(`/llm/test/${model}`, config);
    }

    /**
     * Summarization Module - Comparar resúmenes
     */
    async compareSummaries(data) {
        return this.post('/summarization/compare', data);
    }

    /**
     * Summarization Module - Obtener configuración
     */
    async getSummarizationConfig() {
        return this.get('/summarization/config');
    }

    /**
     * Summarization Module - Probar resumen simple
     */
    async testSingleSummary(text, model, maxWords = 100, temperature = 0.7) {
        return this.post('/summarization/test', {
            text,
            model,
            max_words: maxWords,
            temperature
        });
    }

    // ===== MÉTODOS FUTUROS (Extraction Module) =====
    /**
     * Extraction Module - Extraer campos (futuro)
     */
    async extractFields(data) {
        return this.post('/extraction/fields', data);
    }

    // ===== MÉTODOS FUTUROS (Documents Module) =====
    /**
     * Documents Module - Subir documento (futuro)
     */
    async uploadDocument(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${this.baseURL}/documents/upload`, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(this.timeout)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Health check del sistema
     */
    async healthCheck() {
        return this.get('/health');
    }
}

// Instancia global del cliente API
window.apiClient = new APIClient();
