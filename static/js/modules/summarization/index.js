/**
 * Summarization Module - Módulo de resúmenes
 * Maneja la comparación de modelos para resúmenes
 */

class SummarizationModule {
    constructor() {
        this.container = null;
        this.isComparing = false;
        this.allModels = [];
        this.filteredModels = [];
        this.selectedModels = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.init();
    }

    init() {
        console.log('📝 Inicializando módulo Summarization');
        this.setupEventListeners();
        this.loadConfiguration();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Listener para cambios de estado
        stateManager.addListener('summarization', (newState, oldState) => {
            this.handleStateChange(newState, oldState);
        });

        // Listener para cambios de LLM
        stateManager.addListener('llm', (newState, oldState) => {
            this.handleLLMStateChange(newState, oldState);
        });
    }

    /**
     * Manejar cambios de estado del módulo
     */
    handleStateChange(newState, oldState) {
        if (newState.isComparing !== oldState.isComparing) {
            this.updateCompareButton(newState.isComparing);
        }

        if (newState.results && newState.results.length > 0) {
            this.displayResults(newState.results, newState.evaluations, newState.winner);
        }
    }

    /**
     * Manejar cambios de estado de LLM
     */
    handleLLMStateChange(newState, oldState) {
        if (newState.availableModels && newState.availableModels.length > 0) {
            this.updateModelSelector(newState.availableModels);
        }
        
        // Sincronizar modelos seleccionados del estado
        if (newState.selectedModels && newState.selectedModels.length !== this.selectedModels.length) {
            this.selectedModels = newState.selectedModels || [];
            this.updateModelItemStates();
            this.updateSelectionSummary();
        }
    }

    /**
     * Cargar configuración inicial
     */
    async loadConfiguration() {
        try {
            const config = await apiClient.getSummarizationConfig();
            stateManager.setSummarizationState({
                maxWords: config.default_max_words || 100
            });
        } catch (error) {
            console.error('Error cargando configuración:', error);
        }
    }

    /**
     * Renderizar el módulo
     */
    render() {
        console.log('🔄 Renderizando módulo Summarization...');
        
        const container = document.getElementById('summarization-module');
        if (!container) {
            console.error('❌ No se encontró el contenedor summarization-module');
            return;
        }

        console.log('✅ Contenedor encontrado, configurando event listeners...');
        this.setupModuleEventListeners();
        this.loadAvailableModels();
    }

    /**
     * Configurar event listeners del módulo
     */
    setupModuleEventListeners() {
        // Input de texto
        const textInput = document.getElementById('text-input');
        if (textInput) {
            textInput.addEventListener('input', () => this.updateTextStats());
        }

        // Configuración LLM
        const temperature = document.getElementById('temperature');
        if (temperature) {
            temperature.addEventListener('input', () => this.updateConfigValue('temperature'));
        }

        const topP = document.getElementById('top-p');
        if (topP) {
            topP.addEventListener('input', () => this.updateConfigValue('top-p'));
        }

        // Botón de comparación
        const compareButton = document.getElementById('compare-button');
        if (compareButton) {
            compareButton.addEventListener('click', () => this.startComparison());
        }

        // Búsqueda de modelos
        const modelSearch = document.getElementById('model-search');
        if (modelSearch) {
            modelSearch.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filtros de proveedor
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e.target.dataset.provider));
        });
    }

    /**
     * Cargar modelos disponibles
     */
    async loadAvailableModels() {
        console.log('🔄 Cargando modelos disponibles...');
        
        try {
            // Verificar si apiClient está disponible
            if (!window.apiClient) {
                throw new Error('API Client no está disponible');
            }
            
            console.log('✅ API Client disponible:', window.apiClient);
            console.log('✅ Base URL:', window.apiClient.baseURL);
            
            const llmState = stateManager.getLLMState();
            console.log('📊 Estado LLM actual:', llmState);
            
            if (llmState.availableModels && llmState.availableModels.length > 0) {
                console.log('✅ Usando modelos del estado:', llmState.availableModels.length);
                this.updateModelSelector(llmState.availableModels);
            } else {
                console.log('🔄 Cargando modelos desde API...');
                console.log('🔄 URL que se va a llamar:', window.apiClient.baseURL + '/llm/models');
                
                // Cargar modelos desde la API
                const models = await apiClient.getLLMModels();
                console.log('✅ Modelos obtenidos de API:', models);
                this.updateModelSelector(models.available_models || []);
            }
        } catch (error) {
            console.error('❌ Error cargando modelos:', error);
            console.error('❌ Error details:', error.stack);
            showError('Error cargando modelos disponibles: ' + error.message);
        }
    }

    /**
     * Actualizar selector de modelos
     */
    updateModelSelector(models) {
        console.log('🔄 Actualizando selector de modelos:', models);
        
        const modelGrid = document.getElementById('model-grid');
        if (!modelGrid) {
            console.error('❌ No se encontró el elemento model-grid');
            return;
        }

        if (!models || models.length === 0) {
            console.warn('⚠️ No hay modelos disponibles');
            modelGrid.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <div class="error-title">No Models Available</div>
                    <div class="error-message">No se pudieron cargar los modelos</div>
                </div>
            `;
            return;
        }

        // Guardar todos los modelos
        this.allModels = models;
        this.filteredModels = [...models];
        
        console.log(`✅ Renderizando ${models.length} modelos`);
        this.renderModelGrid();
    }

    /**
     * Renderizar la grilla de modelos
     */
    renderModelGrid() {
        const modelGrid = document.getElementById('model-grid');
        if (!modelGrid) return;

        if (this.filteredModels.length === 0) {
            modelGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <div class="no-results-title">No Models Found</div>
                    <div class="no-results-message">Try adjusting your search or filter</div>
                </div>
            `;
            return;
        }

        modelGrid.innerHTML = this.filteredModels.map(model => `
            <div class="model-item" data-model="${model}" data-provider="${this.getProviderFromModel(model).toLowerCase()}">
                <input type="checkbox" class="model-checkbox" id="model-${model}" ${this.selectedModels.includes(model) ? 'checked' : ''}>
                <div class="model-info">
                    <div class="model-name">${model}</div>
                    <div class="model-provider">${this.getProviderFromModel(model)}</div>
                </div>
            </div>
        `).join('');

        // Agregar event listeners a los checkboxes
        modelGrid.querySelectorAll('.model-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateSelectedModels());
        });

        // Actualizar estado visual
        this.updateModelItemStates();
        this.updateSelectionSummary();
        
        console.log('✅ Grilla de modelos renderizada correctamente');
        console.log('📊 Modelos seleccionados actuales:', this.selectedModels);
    }

    /**
     * Obtener proveedor del nombre del modelo
     */
    getProviderFromModel(model) {
        if (model.startsWith('gpt')) return 'OpenAI';
        if (model.startsWith('claude')) return 'Anthropic';
        if (model.startsWith('gemini')) return 'Google';
        return 'Unknown';
    }

    /**
     * Manejar búsqueda de modelos
     */
    handleSearch(searchTerm) {
        this.currentSearch = searchTerm.toLowerCase();
        this.applyFilters();
    }

    /**
     * Manejar filtro de proveedor
     */
    handleFilter(provider) {
        // Actualizar botones de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-provider="${provider}"]`).classList.add('active');
        
        this.currentFilter = provider;
        this.applyFilters();
    }

    /**
     * Aplicar filtros
     */
    applyFilters() {
        this.filteredModels = this.allModels.filter(model => {
            // Filtro por proveedor
            const provider = this.getProviderFromModel(model).toLowerCase();
            const providerMatch = this.currentFilter === 'all' || provider === this.currentFilter;
            
            // Filtro por búsqueda
            const searchMatch = this.currentSearch === '' || 
                              model.toLowerCase().includes(this.currentSearch) ||
                              provider.includes(this.currentSearch);
            
            return providerMatch && searchMatch;
        });
        
        this.renderModelGrid();
    }

    /**
     * Actualizar modelos seleccionados
     */
    updateSelectedModels() {
        const checkboxes = document.querySelectorAll('.model-checkbox:checked');
        this.selectedModels = Array.from(checkboxes).map(cb => cb.id.replace('model-', ''));
        
        stateManager.setLLMState({ selectedModels: this.selectedModels });
        
        // Actualizar estado visual
        this.updateModelItemStates();
        this.updateSelectionSummary();
    }

    /**
     * Actualizar estados visuales de los items
     */
    updateModelItemStates() {
        document.querySelectorAll('.model-item').forEach(item => {
            const checkbox = item.querySelector('.model-checkbox');
            if (checkbox.checked) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    /**
     * Actualizar resumen de selección
     */
    updateSelectionSummary() {
        const summaryContainer = document.getElementById('selection-summary');
        const selectedList = document.getElementById('selected-models-list');
        
        if (!summaryContainer || !selectedList) return;

        if (this.selectedModels.length === 0) {
            summaryContainer.style.display = 'none';
            return;
        }

        summaryContainer.style.display = 'block';
        selectedList.innerHTML = this.selectedModels.map(model => `
            <div class="selected-model-tag">
                <span>${model}</span>
                <button class="remove-btn" onclick="summarizationModule.removeModel('${model}')">×</button>
            </div>
        `).join('');
    }

    /**
     * Remover modelo de la selección
     */
    removeModel(model) {
        this.selectedModels = this.selectedModels.filter(m => m !== model);
        stateManager.setLLMState({ selectedModels: this.selectedModels });
        
        // Actualizar checkbox
        const checkbox = document.getElementById(`model-${model}`);
        if (checkbox) {
            checkbox.checked = false;
        }
        
        this.updateModelItemStates();
        this.updateSelectionSummary();
    }

    /**
     * Actualizar estadísticas del texto
     */
    updateTextStats() {
        const textInput = document.getElementById('text-input');
        const wordCount = document.getElementById('word-count');
        const charCount = document.getElementById('char-count');
        
        if (!textInput || !wordCount || !charCount) return;

        const text = textInput.value;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const chars = text.length;

        wordCount.textContent = `${words} words`;
        charCount.textContent = `${chars} characters`;

        // Actualizar estado
        stateManager.setSummarizationState({ originalText: text });
    }

    /**
     * Actualizar valor de configuración
     */
    updateConfigValue(field) {
        const input = document.getElementById(field);
        const valueDisplay = document.getElementById(`${field}-value`);
        
        if (input && valueDisplay) {
            valueDisplay.textContent = input.value;
        }
    }

    /**
     * Iniciar comparación
     */
    async startComparison() {
        const textInput = document.getElementById('text-input');
        const maxWords = document.getElementById('max-words');
        const selectedModels = stateManager.getLLMState().selectedModels;

        // Validaciones
        if (!textInput.value.trim()) {
            showError('Please enter text to summarize');
            return;
        }

        if (selectedModels.length < 2) {
            showError('Please select at least 2 models');
            return;
        }

        if (selectedModels.length > 5) {
            showError('Please select maximum 5 models');
            return;
        }

        try {
            // Actualizar estado
            stateManager.setSummarizationState({ isComparing: true });
            stateManager.setAppState({ loading: true });

            // Configuración LLM
            const llmConfig = {
                temperature: parseFloat(document.getElementById('temperature').value),
                max_tokens: parseInt(document.getElementById('max-tokens').value),
                top_p: parseFloat(document.getElementById('top-p').value),
                top_k: parseInt(document.getElementById('top-k').value),
                frequency_penalty: 0.0,
                presence_penalty: 0.0,
                stream: false
            };

            // Request de comparación
            const request = {
                text: textInput.value.trim(),
                models: selectedModels,
                max_words: parseInt(maxWords.value),
                llm_config: llmConfig
            };

            console.log('🚀 Iniciando comparación:', request);
            console.log('⏱️ Timeout configurado:', apiClient.timeout / 1000, 'segundos');

            // Llamar a la API con timeout personalizado
            const result = await apiClient.compareSummaries(request);

            // Actualizar estado con resultados
            stateManager.setSummarizationState({
                results: result.results,
                evaluations: result.evaluations,
                winner: result.winner,
                isComparing: false
            });

            console.log('✅ Comparación completada:', result);

        } catch (error) {
            console.error('❌ Error en comparación:', error);
            
            // Manejar diferentes tipos de errores
            let errorMessage = 'Error during comparison: ';
            if (error.name === 'AbortError' || error.message.includes('aborted')) {
                errorMessage += 'Request was cancelled or timed out. Please try again with fewer models or shorter text.';
            } else if (error.message.includes('HTTP 500')) {
                errorMessage += 'Server error. Please try again later.';
            } else if (error.message.includes('HTTP 422')) {
                errorMessage += 'Invalid request. Please check your input.';
            } else {
                errorMessage += error.message;
            }
            
            showError(errorMessage);
            stateManager.setSummarizationState({ isComparing: false });
        } finally {
            stateManager.setAppState({ loading: false });
        }
    }

    /**
     * Actualizar botón de comparación
     */
    updateCompareButton(isComparing) {
        const button = document.getElementById('compare-button');
        if (!button) return;

        if (isComparing) {
            button.disabled = true;
            button.innerHTML = `
                <div class="spinner"></div>
                <span>Comparing models... This may take a few minutes</span>
            `;
        } else {
            button.disabled = false;
            button.innerHTML = `
                <span class="compare-icon">🚀</span>
                <span class="compare-text">Compare Models</span>
            `;
        }
    }

    /**
     * Mostrar resultados
     */
    displayResults(results, evaluations, winner) {
        const resultsSection = document.getElementById('results-section');
        const resultsGrid = document.getElementById('results-grid');
        const resultsStats = document.getElementById('results-stats');

        if (!resultsSection || !resultsGrid || !resultsStats) return;

        // Mostrar sección de resultados
        resultsSection.style.display = 'block';

        // Estadísticas
        const totalTime = results.reduce((sum, result) => sum + result.execution_time, 0);
        const successfulTests = results.reduce((sum, result) => sum + result.success_count, 0);
        const totalTests = results.length * 3; // 3 resúmenes por modelo

        resultsStats.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Time</span>
                    <span class="stat-value">⏱️ ${formatTime(totalTime)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Success Rate</span>
                    <span class="stat-value">✅ ${successfulTests}/${totalTests}</span>
                </div>
                <div class="stat-item winner-stat">
                    <span class="stat-label">🏆 Winner</span>
                    <span class="stat-value winner-name">${winner}</span>
                </div>
            </div>
        `;

        // Resultados por modelo
        resultsGrid.innerHTML = results.map((result, index) => {
            const evaluation = evaluations.find(e => e.model === result.model);
            const isWinner = result.model === winner;
            
            return `
                <div class="result-card ${isWinner ? 'winner' : ''}">
                    <div class="result-header">
                        <div class="model-info">
                            <h3 class="result-model">${result.model}</h3>
                            ${isWinner ? '<div class="winner-badge">🏆 WINNER</div>' : ''}
                        </div>
                        <div class="score-summary">
                            <div class="main-score ${this.getScoreClass(evaluation?.average_score || 0)}">
                                ${evaluation ? `${evaluation.average_score.toFixed(1)}/15` : 'N/A'}
                            </div>
                            <div class="score-label">Overall Score</div>
                        </div>
                    </div>
                    
                    <div class="result-metrics">
                        <div class="metric">
                            <span class="metric-label">Avg Length</span>
                            <span class="metric-value">${result.avg_length.toFixed(1)} words</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Execution Time</span>
                            <span class="metric-value">${formatTime(result.execution_time)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Success Rate</span>
                            <span class="metric-value">${result.success_count}/3</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Consistency</span>
                            <span class="metric-value">${evaluation ? `${evaluation.consistency_score.toFixed(1)}%` : 'N/A'}</span>
                        </div>
                    </div>

                    <div class="result-summary">
                        <div class="result-summary-title">Best Summary</div>
                        <div>${result.summaries[0] || 'No summary available'}</div>
                    </div>

                    ${evaluation && evaluation.evaluation_details && evaluation.evaluation_details.length > 0 ? `
                    <div class="result-evaluation">
                        <div class="result-evaluation-title">📊 Detailed Evaluation (Avg: ${evaluation.average_score.toFixed(1)}/15)</div>
                        
                        ${evaluation.individual_summaries && evaluation.individual_summaries.length > 0 ? `
                        <div class="individual-summaries">
                            <div class="summaries-list">
                                ${evaluation.individual_summaries.map((summary, idx) => {
                                    const details = evaluation.evaluation_details[idx] || {};
                                    const totalScore = evaluation.similarity_scores[idx] || 0;
                                    return `
                                    <div class="summary-item">
                                        <div class="summary-header">
                                            <span class="summary-number">Summary ${idx + 1}</span>
                                            <span class="summary-total-score">Total: ${totalScore}/15</span>
                                        </div>
                                        
                                        <div class="evaluation-scores">
                                            <div class="score-item">
                                                <span class="score-label">Precisión:</span>
                                                <span class="score-value precision">${details.precision || 'N/A'}/5</span>
                                            </div>
                                            <div class="score-item">
                                                <span class="score-label">Completitud:</span>
                                                <span class="score-value completeness">${details.completeness || 'N/A'}/5</span>
                                            </div>
                                            <div class="score-item">
                                                <span class="score-label">Claridad:</span>
                                                <span class="score-value clarity">${details.clarity || 'N/A'}/5</span>
                                            </div>
                                        </div>
                                        
                                        ${details.comment ? `
                                        <div class="evaluation-comment">
                                            <strong>Comentario:</strong> ${details.comment}
                                        </div>
                                        ` : ''}
                                        
                                        <div class="summary-text">${summary}</div>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Agregar recomendaciones
        this.addRecommendations(results, evaluations, winner);
        
        // Scroll a resultados
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Agregar recomendaciones para ayudar al usuario
     */
    addRecommendations(results, evaluations, winner) {
        const resultsSection = document.getElementById('results-section');
        if (!resultsSection) return;

        // Crear sección de recomendaciones si no existe
        let recommendationsSection = document.getElementById('recommendations-section');
        if (!recommendationsSection) {
            recommendationsSection = document.createElement('div');
            recommendationsSection.id = 'recommendations-section';
            recommendationsSection.className = 'recommendations-section';
            resultsSection.appendChild(recommendationsSection);
        }

        // Analizar resultados para generar recomendaciones
        const winnerEval = evaluations.find(e => e.model === winner);
        const winnerResult = results.find(r => r.model === winner);
        
        if (!winnerEval || !winnerResult) return;

        // Calcular fortalezas del ganador
        const avgPrecision = winnerEval.evaluation_details?.reduce((sum, d) => sum + (d.precision || 0), 0) / winnerEval.evaluation_details?.length || 0;
        const avgCompleteness = winnerEval.evaluation_details?.reduce((sum, d) => sum + (d.completeness || 0), 0) / winnerEval.evaluation_details?.length || 0;
        const avgClarity = winnerEval.evaluation_details?.reduce((sum, d) => sum + (d.clarity || 0), 0) / winnerEval.evaluation_details?.length || 0;

        const strengths = [];
        if (avgPrecision >= 4.5) strengths.push("Muy preciso");
        if (avgCompleteness >= 4.5) strengths.push("Muy completo");
        if (avgClarity >= 4.5) strengths.push("Muy claro");

        const speedRank = results.sort((a, b) => a.execution_time - b.execution_time);
        const isFastest = speedRank[0].model === winner;

        recommendationsSection.innerHTML = `
            <div class="recommendations">
                <h3 class="recommendations-title">🎯 Recommendations</h3>
                
                <div class="recommendation-cards">
                    <div class="recommendation-card winner-rec">
                        <div class="rec-header">
                            <span class="rec-icon">🏆</span>
                            <span class="rec-title">Best Overall: ${winner}</span>
                        </div>
                        <div class="rec-content">
                            <p><strong>Score:</strong> ${winnerEval.average_score.toFixed(1)}/15</p>
                            <p><strong>Strengths:</strong> ${strengths.length > 0 ? strengths.join(', ') : 'Balanced performance'}</p>
                            <p><strong>Speed:</strong> ${isFastest ? 'Fastest model' : formatTime(winnerResult.execution_time)}</p>
                            <p class="rec-advice">✅ <strong>Use this model when:</strong> You need the best balance of quality and reliability</p>
                        </div>
                    </div>

                    ${speedRank[0].model !== winner ? `
                    <div class="recommendation-card speed-rec">
                        <div class="rec-header">
                            <span class="rec-icon">⚡</span>
                            <span class="rec-title">Fastest: ${speedRank[0].model}</span>
                        </div>
                        <div class="rec-content">
                            <p><strong>Speed:</strong> ${formatTime(speedRank[0].execution_time)}</p>
                            <p><strong>Quality:</strong> ${(evaluations.find(e => e.model === speedRank[0].model)?.average_score || 0).toFixed(1)}/15</p>
                            <p class="rec-advice">⚡ <strong>Use this model when:</strong> You need quick results and quality is secondary</p>
                        </div>
                    </div>
                    ` : ''}

                    <div class="recommendation-card general-rec">
                        <div class="rec-header">
                            <span class="rec-icon">💡</span>
                            <span class="rec-title">General Advice</span>
                        </div>
                        <div class="rec-content">
                            <p><strong>For accuracy:</strong> Choose models with high Precision scores (4-5/5)</p>
                            <p><strong>For completeness:</strong> Choose models with high Completeness scores (4-5/5)</p>
                            <p><strong>For readability:</strong> Choose models with high Clarity scores (4-5/5)</p>
                            <p class="rec-advice">📊 <strong>Tip:</strong> Look at individual scores to match your specific needs</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Obtener clase CSS para score
     */
    getScoreClass(score) {
        // Nuevo rango: 3-15 puntos
        if (score >= 12) return 'high';    // 12-15 = Excelente
        if (score >= 9) return 'medium';   // 9-11 = Bueno
        return 'low';                      // 3-8 = Necesita mejora
    }
}

// Instancia global del módulo
window.summarizationModule = new SummarizationModule();

// Renderizar cuando se carga el módulo
document.addEventListener('DOMContentLoaded', () => {
    if (window.summarizationModule) {
        window.summarizationModule.render();
    }
});

// También renderizar cuando se navega al módulo
window.addEventListener('load', () => {
    if (window.summarizationModule) {
        window.summarizationModule.render();
    }
});

console.log('✅ Summarization module loaded');