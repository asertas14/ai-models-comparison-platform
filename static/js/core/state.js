/**
 * Core State Management - Estado global de la aplicación
 * Maneja el estado compartido entre módulos
 */
class StateManager {
    constructor() {
        this.state = {
            // Estado global de la aplicación
            app: {
                loading: false,
                error: null,
                currentModule: 'dashboard'
            },
            
            // Estado del módulo LLM
            llm: {
                availableModels: [],
                availableProviders: [],
                selectedModels: [],
                config: {
                    temperature: 0.7,
                    maxTokens: 1000,
                    topP: 1.0,
                    topK: 50,
                    frequencyPenalty: 0.0,
                    presencePenalty: 0.0,
                    stream: false
                }
            },
            
            // Estado del módulo Summarization
            summarization: {
                originalText: '',
                maxWords: 100,
                results: [],
                evaluations: [],
                winner: null,
                isComparing: false
            },
            
            // Estado del módulo Extraction (futuro)
            extraction: {
                text: '',
                fields: [],
                results: [],
                isExtracting: false
            },
            
            // Estado del módulo Documents (futuro)
            documents: {
                uploadedFiles: [],
                processingFiles: [],
                results: []
            }
        };
        
        this.listeners = new Map();
        this.init();
    }

    init() {
        // Configurar listeners para cambios de estado
        this.setupStateListeners();
    }

    /**
     * Obtener estado completo
     */
    getState() {
        return this.state;
    }

    /**
     * Obtener estado de un módulo específico
     */
    getModuleState(moduleName) {
        return this.state[moduleName] || {};
    }

    /**
     * Actualizar estado
     */
    setState(moduleName, newState) {
        if (!this.state[moduleName]) {
            this.state[moduleName] = {};
        }
        
        const oldState = { ...this.state[moduleName] };
        this.state[moduleName] = { ...this.state[moduleName], ...newState };
        
        // Notificar a los listeners
        this.notifyListeners(moduleName, this.state[moduleName], oldState);
        
        console.log(`🔄 Estado actualizado [${moduleName}]:`, this.state[moduleName]);
    }

    /**
     * Actualizar estado global de la app
     */
    setAppState(newState) {
        this.setState('app', newState);
    }

    /**
     * Configurar listeners para cambios de estado
     */
    setupStateListeners() {
        // Listener para cambios de loading
        this.addListener('app', (newState, oldState) => {
            if (newState.loading !== oldState.loading) {
                this.updateLoadingUI(newState.loading);
            }
        });

        // Listener para errores
        this.addListener('app', (newState, oldState) => {
            if (newState.error !== oldState.error) {
                this.updateErrorUI(newState.error);
            }
        });
    }

    /**
     * Agregar listener para un módulo
     */
    addListener(moduleName, callback) {
        if (!this.listeners.has(moduleName)) {
            this.listeners.set(moduleName, []);
        }
        this.listeners.get(moduleName).push(callback);
    }

    /**
     * Remover listener
     */
    removeListener(moduleName, callback) {
        if (this.listeners.has(moduleName)) {
            const moduleListeners = this.listeners.get(moduleName);
            const index = moduleListeners.indexOf(callback);
            if (index > -1) {
                moduleListeners.splice(index, 1);
            }
        }
    }

    /**
     * Notificar a los listeners
     */
    notifyListeners(moduleName, newState, oldState) {
        if (this.listeners.has(moduleName)) {
            this.listeners.get(moduleName).forEach(callback => {
                try {
                    callback(newState, oldState);
                } catch (error) {
                    console.error(`Error en listener de ${moduleName}:`, error);
                }
            });
        }
    }

    /**
     * Actualizar UI de loading
     */
    updateLoadingUI(loading) {
        const loadingElements = document.querySelectorAll('.loading-indicator');
        loadingElements.forEach(element => {
            element.style.display = loading ? 'block' : 'none';
        });

        // Deshabilitar botones durante loading
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = loading;
        });
    }

    /**
     * Actualizar UI de error
     */
    updateErrorUI(error) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            if (error) {
                errorContainer.innerHTML = `
                    <div class="error-message">
                        <h3>❌ Error</h3>
                        <p>${error}</p>
                        <button onclick="stateManager.setAppState({error: null})">✖️ Cerrar</button>
                    </div>
                `;
                errorContainer.style.display = 'block';
            } else {
                errorContainer.style.display = 'none';
            }
        }
    }

    /**
     * Métodos de conveniencia para módulos específicos
     */
    
    // LLM Module
    setLLMState(newState) {
        this.setState('llm', newState);
    }

    getLLMState() {
        return this.getModuleState('llm');
    }

    // Summarization Module
    setSummarizationState(newState) {
        this.setState('summarization', newState);
    }

    getSummarizationState() {
        return this.getModuleState('summarization');
    }

    // Extraction Module (futuro)
    setExtractionState(newState) {
        this.setState('extraction', newState);
    }

    getExtractionState() {
        return this.getModuleState('extraction');
    }

    // Documents Module (futuro)
    setDocumentsState(newState) {
        this.setState('documents', newState);
    }

    getDocumentsState() {
        return this.getModuleState('documents');
    }

    /**
     * Resetear estado de un módulo
     */
    resetModuleState(moduleName) {
        if (this.state[moduleName]) {
            this.state[moduleName] = {};
            this.notifyListeners(moduleName, {}, this.state[moduleName]);
        }
    }

    /**
     * Resetear todo el estado
     */
    resetAllState() {
        this.state = {
            app: { loading: false, error: null, currentModule: 'dashboard' },
            llm: { availableModels: [], selectedModels: [], config: {} },
            summarization: { originalText: '', results: [], isComparing: false },
            extraction: { text: '', fields: [], results: [], isExtracting: false },
            documents: { uploadedFiles: [], processingFiles: [], results: [] }
        };
        
        this.listeners.forEach((listeners, moduleName) => {
            listeners.forEach(callback => {
                try {
                    callback(this.state[moduleName], {});
                } catch (error) {
                    console.error(`Error en listener de ${moduleName}:`, error);
                }
            });
        });
    }
}

// Instancia global del state manager
window.stateManager = new StateManager();
