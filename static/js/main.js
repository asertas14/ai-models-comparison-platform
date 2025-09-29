/**
 * Main JavaScript - Punto de entrada de la aplicación
 * Inicializa la aplicación y maneja el estado global
 */

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando AI Models Comparison App');
    
    try {
        // Inicializar estado de la aplicación
        await initializeApp();
        
        // Cargar datos iniciales
        await loadInitialData();
        
        // Configurar listeners globales
        setupGlobalListeners();
        
        console.log('✅ Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
        showError('Error inicializando la aplicación: ' + error.message);
    }
});

/**
 * Inicializar la aplicación
 */
async function initializeApp() {
    // Verificar que los servicios estén disponibles
    if (!window.apiClient) {
        throw new Error('API Client no está disponible');
    }
    
    if (!window.stateManager) {
        throw new Error('State Manager no está disponible');
    }
    
    if (!window.router) {
        throw new Error('Router no está disponible');
    }
    
    // Configurar estado inicial
    stateManager.setAppState({
        loading: false,
        error: null,
        currentModule: 'dashboard'
    });
    
    console.log('✅ Servicios inicializados');
}

/**
 * Cargar datos iniciales
 */
async function loadInitialData() {
    try {
        // Mostrar loading
        stateManager.setAppState({ loading: true });
        
        // Cargar configuración de LLM
        const llmConfig = await apiClient.getLLMConfig();
        stateManager.setLLMState({
            availableModels: llmConfig.available_models || [],
            availableProviders: llmConfig.available_providers || [],
            config: llmConfig.current_config || {}
        });
        
        // Cargar configuración de Summarization
        const summarizationConfig = await apiClient.getSummarizationConfig();
        stateManager.setSummarizationState({
            maxWords: summarizationConfig.default_max_words || 100
        });
        
        // Actualizar estadísticas del dashboard
        updateDashboardStats();
        
        console.log('✅ Datos iniciales cargados');
        
    } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error);
        // No mostrar error crítico, solo log
    } finally {
        // Ocultar loading
        stateManager.setAppState({ loading: false });
    }
}

/**
 * Actualizar estadísticas del dashboard
 */
function updateDashboardStats() {
    const llmState = stateManager.getLLMState();
    
    // Actualizar contadores
    const modelsCount = document.getElementById('models-count');
    const providersCount = document.getElementById('providers-count');
    const testsCount = document.getElementById('tests-count');
    const avgScore = document.getElementById('avg-score');
    
    if (modelsCount) {
        modelsCount.textContent = llmState.availableModels?.length || 0;
    }
    
    if (providersCount) {
        providersCount.textContent = llmState.availableProviders?.length || 0;
    }
    
    if (testsCount) {
        testsCount.textContent = '0'; // TODO: Implementar contador de tests
    }
    
    if (avgScore) {
        avgScore.textContent = 'N/A'; // TODO: Implementar score promedio
    }
}

/**
 * Configurar listeners globales
 */
function setupGlobalListeners() {
    // Listener para cambios de estado de loading
    stateManager.addListener('app', (newState, oldState) => {
        if (newState.loading !== oldState.loading) {
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = newState.loading ? 'flex' : 'none';
            }
        }
    });
    
    // Listener para errores
    stateManager.addListener('app', (newState, oldState) => {
        if (newState.error !== oldState.error) {
            if (newState.error) {
                showError(newState.error);
            } else {
                hideError();
            }
        }
    });
    
    // Listener para cambios de módulo
    stateManager.addListener('app', (newState, oldState) => {
        if (newState.currentModule !== oldState.currentModule) {
            console.log(`🔄 Cambiando módulo: ${oldState.currentModule} → ${newState.currentModule}`);
        }
    });
    
    console.log('✅ Listeners globales configurados');
}

/**
 * Mostrar error
 */
function showError(message) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="error-message">
                <h3 class="error-title">❌ Error</h3>
                <p class="error-text">${message}</p>
                <button class="btn btn-error btn-sm" onclick="hideError()">
                    ✖️ Cerrar
                </button>
            </div>
        `;
        errorContainer.style.display = 'block';
    }
}

/**
 * Ocultar error
 */
function hideError() {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
    
    // Limpiar error del estado
    stateManager.setAppState({ error: null });
}

/**
 * Función de utilidad para mostrar notificaciones
 */
function showNotification(message, type = 'info') {
    // Crear contenedor de notificaciones si no existe
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(notificationContainer);
    }

    // Crear notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: var(--cursor-surface);
        border: 1px solid var(--cursor-border);
        border-radius: var(--radius-md);
        padding: 15px 20px;
        box-shadow: var(--shadow-lg);
        color: var(--cursor-text);
        font-size: 14px;
        max-width: 300px;
        animation: slideIn 0.3s ease;
        border-left: 4px solid ${getNotificationColor(type)};
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">${getNotificationIcon(type)}</span>
            <span>${message}</span>
        </div>
    `;

    // Agregar estilos de animación
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    notificationContainer.appendChild(notification);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);

    console.log(`📢 ${type.toUpperCase()}: ${message}`);
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return 'var(--cursor-success)';
        case 'warning': return 'var(--cursor-warning)';
        case 'error': return 'var(--cursor-error)';
        case 'info': return 'var(--cursor-info)';
        default: return 'var(--cursor-accent)';
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'warning': return '⚠️';
        case 'error': return '❌';
        case 'info': return 'ℹ️';
        default: return '📢';
    }
}

/**
 * Función de utilidad para confirmar acciones
 */
function confirmAction(message) {
    return confirm(message);
}

/**
 * Función de utilidad para formatear números
 */
function formatNumber(num) {
    return new Intl.NumberFormat('es-ES').format(num);
}

/**
 * Función de utilidad para formatear tiempo
 */
function formatTime(seconds) {
    if (seconds < 60) {
        return `${seconds.toFixed(1)}s`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
    } else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
}

/**
 * Función de utilidad para formatear tamaño de archivo
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===== EXPORTAR FUNCIONES GLOBALES =====
window.showError = showError;
window.hideError = hideError;
window.showNotification = showNotification;
window.confirmAction = confirmAction;
window.formatNumber = formatNumber;
window.formatTime = formatTime;
window.formatFileSize = formatFileSize;

console.log('✅ Main.js cargado correctamente');
