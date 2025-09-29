/**
 * Core Router - Navegación modular del frontend
 * Maneja la carga dinámica de módulos y navegación
 */
class Router {
    constructor() {
        this.routes = {
            '/': 'dashboard',
            '/summarization': 'summarization',
            '/extraction': 'extraction',    // Futuro
            '/documents': 'documents'       // Futuro
        };
        
        this.currentModule = null;
        this.loadedModules = new Set();
        
        this.init();
    }

    init() {
        // Escuchar cambios en la URL
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Manejar enlaces con data-route
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-route')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('data-route'));
            }
        });

        // Cargar ruta inicial
        this.handleRoute();
    }

    /**
     * Navegar a una ruta específica
     */
    navigate(path) {
        if (path !== window.location.pathname) {
            window.history.pushState({}, '', path);
            this.handleRoute();
        }
    }

    /**
     * Manejar la ruta actual
     */
    async handleRoute() {
        const path = window.location.pathname;
        const moduleName = this.routes[path] || 'dashboard';
        
        console.log(`🔄 Navegando a: ${path} (módulo: ${moduleName})`);
        
        try {
            // Si es dashboard, no necesitamos cargar módulos adicionales
            if (moduleName === 'dashboard') {
                this.activateModule(moduleName);
                this.currentModule = moduleName;
                return;
            }
            
            await this.loadModule(moduleName);
            this.currentModule = moduleName;
        } catch (error) {
            console.error(`Error cargando módulo ${moduleName}:`, error);
            this.showError(`Error cargando módulo: ${moduleName}`);
        }
    }

    /**
     * Cargar un módulo dinámicamente
     */
    async loadModule(moduleName) {
        // Si ya está cargado, solo activar
        if (this.loadedModules.has(moduleName)) {
            this.activateModule(moduleName);
            return;
        }

        console.log(`📦 Cargando módulo: ${moduleName}`);

        // Cargar CSS del módulo
        await this.loadModuleCSS(moduleName);
        
        // Cargar JS del módulo
        await this.loadModuleJS(moduleName);
        
        // Marcar como cargado
        this.loadedModules.add(moduleName);
        
        // Activar el módulo
        this.activateModule(moduleName);
    }

    /**
     * Cargar CSS de un módulo
     */
    async loadModuleCSS(moduleName) {
        const cssPath = `/static/css/modules/${moduleName}.css`;
        
        // Verificar si ya existe el link
        if (document.querySelector(`link[href="${cssPath}"]`)) {
            return;
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssPath;
            link.onload = () => {
                console.log(`✅ CSS cargado: ${moduleName}`);
                resolve();
            };
            link.onerror = () => {
                console.warn(`⚠️ CSS no encontrado: ${moduleName}`);
                resolve(); // No es crítico si no existe CSS específico
            };
            document.head.appendChild(link);
        });
    }

    /**
     * Cargar JS de un módulo
     */
    async loadModuleJS(moduleName) {
        const jsPath = `/static/js/modules/${moduleName}/index.js`;
        
        // Verificar si ya existe el script
        if (document.querySelector(`script[src="${jsPath}"]`)) {
            return;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = jsPath;
            script.onload = () => {
                console.log(`✅ JS cargado: ${moduleName}`);
                resolve();
            };
            script.onerror = () => {
                console.warn(`⚠️ JS no encontrado: ${moduleName}`);
                resolve(); // No es crítico si no existe JS específico
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Activar un módulo
     */
    activateModule(moduleName) {
        // Ocultar todos los módulos
        document.querySelectorAll('.module-container').forEach(container => {
            container.style.display = 'none';
        });

        // Mostrar el módulo actual
        const currentContainer = document.getElementById(`${moduleName}-module`);
        if (currentContainer) {
            currentContainer.style.display = 'block';
            console.log(`✅ Módulo activado: ${moduleName}`);
            
            // Renderizar el módulo si tiene método render
            if (window[`${moduleName}Module`] && typeof window[`${moduleName}Module`].render === 'function') {
                window[`${moduleName}Module`].render();
            }
        } else {
            console.warn(`⚠️ Contenedor no encontrado para módulo: ${moduleName}`);
        }

        // Actualizar navegación activa
        this.updateActiveNavigation(moduleName);
    }

    /**
     * Actualizar navegación activa
     */
    updateActiveNavigation(moduleName) {
        // Remover clase activa de todos los enlaces
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Agregar clase activa al enlace actual
        const activeLink = document.querySelector(`[data-route="/${moduleName === 'dashboard' ? '' : moduleName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Mostrar error
     */
    showError(message) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message">
                    <h3>❌ Error</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()">🔄 Recargar</button>
                </div>
            `;
            errorContainer.style.display = 'block';
        }
    }
}

// Instancia global del router
window.router = new Router();
