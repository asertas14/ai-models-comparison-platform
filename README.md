# 🤖 AI Models Comparison Platform

Una plataforma completa para comparar múltiples modelos de LLM (Large Language Models) de forma concurrente, con sistema de evaluación inteligente y métricas detalladas.

## ✨ Características

### 🎯 **Funcionalidades Principales**
- **Comparación Concurrente**: Ejecuta múltiples modelos en paralelo usando `asyncio.gather`
- **Evaluación Inteligente**: Sistema de evaluación basado en 3 criterios (Precisión, Completitud, Claridad)
- **Métricas Detalladas**: Scores individuales, promedio, consistencia y tiempo de ejecución
- **Interfaz Moderna**: Diseño inspirado en Cursor IDE + Stripe con UX optimizada
- **Arquitectura Modular**: Fácil extensión para nuevos módulos (Classification, Extraction, etc.)
- **Sistema de Recomendaciones**: Sugerencias inteligentes basadas en resultados

### 🔧 **Tecnologías**
- **Backend**: FastAPI + Pydantic + Uvicorn
- **Frontend**: Vanilla JavaScript ES6+ + CSS Grid + Flexbox
- **LLM Providers**: OpenAI, Anthropic, Google
- **Concurrencia**: `asyncio.gather` para ejecución paralela
- **Deployment**: GitHub + Docker + Gunicorn
- **CI/CD**: GitHub Actions con testing automático

## 🚀 Inicio Rápido

### Prerrequisitos
- Python 3.8+
- API Keys de los proveedores de LLM

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/asertas14/ai-models-comparison-platform.git
cd ai-models-comparison-platform
```

2. **Crear entorno virtual**
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus API keys
```

5. **Ejecutar la aplicación**
```bash
python main.py
```

La aplicación estará disponible en `http://localhost:8000`

## 🔑 Configuración de API Keys

Crea un archivo `.env` en la raíz del proyecto:

```bash
# OpenAI
OPENAI_API_KEY=tu_openai_api_key_aqui

# Anthropic (opcional)
ANTHROPIC_API_KEY=tu_anthropic_api_key_aqui

# Google (opcional)
GOOGLE_API_KEY=tu_google_api_key_aqui

# Configuración del servidor
DEBUG=true
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO
```

## 📁 Estructura del Proyecto

```
ai-models-comparison-platform/
├── .github/                       # GitHub Actions & Templates
│   ├── workflows/ci.yml           # CI/CD Pipeline
│   └── ISSUE_TEMPLATE/            # Bug & Feature Templates
├── .devcontainer/                 # GitHub Codespaces
│   └── devcontainer.json          # Dev environment config
├── app/                          # Backend FastAPI
│   ├── llm/                      # Módulo LLM genérico
│   │   ├── config.py             # Configuración LLM
│   │   ├── models.py              # Modelos Pydantic
│   │   ├── service.py             # Servicio LLM
│   │   └── router.py              # Rutas API
│   ├── summarization/             # Módulo Summarization
│   │   ├── config.py             # Configuración
│   │   ├── models.py              # Modelos
│   │   ├── service.py             # Servicio
│   │   ├── evaluator.py          # Evaluador inteligente
│   │   └── router.py              # Rutas
│   └── config.py                  # Configuración global
├── static/                        # Frontend
│   ├── css/                       # Estilos
│   │   ├── themes/                # Temas (Cursor + Stripe)
│   │   └── modules/                # Estilos por módulo
│   └── js/                        # JavaScript ES6+
│       ├── core/                  # Core frontend (API, Router, State)
│       └── modules/               # Módulos frontend
├── templates/                     # Templates HTML (Jinja2)
├── main.py                        # Punto de entrada FastAPI
├── requirements.txt               # Dependencias Python
├── env.example                    # Variables de entorno ejemplo
├── CONTRIBUTING.md                # Guía de contribución
├── LICENSE                        # MIT License
└── README.md                      # Este archivo
```

## 🎨 Arquitectura

### Backend (FastAPI)
- **Arquitectura Modular**: Cada funcionalidad en su propio módulo
- **Concurrencia**: `asyncio.gather` para ejecución paralela
- **Evaluación**: Sistema de reconstrucción de texto para evaluar resúmenes
- **API RESTful**: Endpoints bien documentados

### Frontend (Vanilla JS)
- **Modular**: JavaScript organizado por módulos
- **Responsive**: CSS Grid + Flexbox
- **Tema**: Inspirado en Cursor IDE + Stripe
- **Estado**: Gestión de estado centralizada

## 🔬 Sistema de Evaluación Inteligente

### Método de Evaluación por Criterios
1. **Generación**: Se generan 3 resúmenes por modelo (optimizado para costos)
2. **Evaluación Individual**: Cada resumen se evalúa en 3 criterios (1-5 puntos cada uno):
   - **Precisión**: Qué tan preciso es el resumen
   - **Completitud**: Qué tan completo es el resumen
   - **Claridad**: Qué tan claro y comprensible es
3. **Reconstrucción General**: Un modelo evaluador reconstruye el texto original
4. **Similitud**: Se calcula la similitud Jaccard entre original y reconstruido
5. **Consistencia**: Mide la consistencia entre los 3 resúmenes

### Métricas
- **Score Individual**: 3-15 puntos por resumen (3 criterios × 1-5 puntos)
- **Score Promedio**: Promedio de todos los resúmenes del modelo
- **Score Mejor**: Mejor resumen individual del modelo
- **Score Peor**: Peor resumen individual del modelo
- **Consistencia**: Qué tan consistentes son los resúmenes entre sí
- **Tiempo de Ejecución**: Tiempo de ejecución por modelo

## 🚀 Deployment

### Desarrollo Local

```bash
# Clonar y configurar
git clone https://github.com/asertas14/ai-models-comparison-platform.git
cd ai-models-comparison-platform
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus API keys

# Ejecutar
python main.py
```

### Deployment en Servidor

```bash
# Usar gunicorn para producción
pip install gunicorn
gunicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker (Opcional)

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

## 📊 Uso de la Aplicación

### 1. Dashboard
- **Estadísticas**: Modelos disponibles, proveedores activos
- **Acciones Rápidas**: Navegación a módulos
- **Estado del Sistema**: Health check y configuración

### 2. Summarization Module
- **Selección de Modelos**: Filtros por proveedor, búsqueda inteligente
- **Configuración LLM**: Temperature, tokens, top-p, top-k
- **Input de Texto**: Textarea con contador de palabras (mínimo 100 caracteres)
- **Comparación**: Ejecuta modelos en paralelo (3 muestras por modelo)
- **Resultados**: 
  - Scores individuales (Precisión, Completitud, Claridad)
  - Score promedio, mejor y peor
  - Reconstrucción general del texto
  - Resúmenes individuales con evaluación detallada
  - Sistema de recomendaciones inteligentes

### 3. Filtros y Búsqueda
- **Por Proveedor**: OpenAI, Google, Anthropic
- **Búsqueda**: Por nombre de modelo o proveedor
- **Selección Persistente**: Se mantiene al cambiar filtros

## 🔧 API Endpoints

### LLM Module
- `GET /llm/models` - Lista modelos disponibles
- `GET /llm/config` - Configuración LLM
- `POST /llm/test/{model}` - Probar modelo específico

### Summarization Module
- `POST /summarization/compare` - Comparar modelos
- `GET /summarization/config` - Configuración
- `POST /summarization/test` - Probar resumen simple

### Sistema
- `GET /health` - Health check
- `GET /` - Dashboard principal

## 🧪 Testing

### Pruebas Automáticas (GitHub Actions)
```bash
# Probar API
curl http://localhost:8000/health

# Probar modelos
curl http://localhost:8000/llm/models

# Probar configuración
curl http://localhost:8000/summarization/config

# Probar resumen simple
curl -X POST "http://localhost:8000/summarization/test" \
  -H "Content-Type: application/json" \
  -d '{"text":"Este es un texto de prueba para verificar que el sistema funciona correctamente. Debe tener al menos 100 caracteres para cumplir con los requisitos mínimos del sistema.","model":"gpt-3.5-turbo","max_words":20}'
```

### Pruebas Manuales
1. **Navegación**: Dashboard → Summarization (usando router client-side)
2. **Selección**: Filtrar por proveedor, buscar modelos, seleccionar múltiples
3. **Configuración**: Ajustar parámetros LLM (temperature, tokens, etc.)
4. **Comparación**: Ingresar texto (mínimo 100 caracteres) + modelos seleccionados
5. **Resultados**: Verificar scores individuales, promedio, reconstrucción y recomendaciones

## 🛠️ Desarrollo

### Agregar Nuevo Módulo
1. Crear directorio en `app/`
2. Implementar `config.py`, `models.py`, `service.py`, `router.py`
3. Agregar rutas en `main.py`
4. Crear frontend en `static/js/modules/`
5. Agregar estilos en `static/css/modules/`

### Agregar Nuevo Proveedor LLM
1. Implementar cliente en `app/llm/service.py`
2. Agregar configuración en `app/config.py`
3. Actualizar detección de proveedor
4. Probar con API key

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] **Extraction Module**: Extracción de campos estructurados
- [ ] **Documents Module**: Procesamiento de PDF, Word, Excel
- [ ] **Classification Module**: Clasificación de texto
- [ ] **Sentiment Module**: Análisis de sentimientos
- [ ] **Gráficos Interactivos**: Visualización de resultados
- [ ] **Historial**: Guardar comparaciones anteriores
- [ ] **Export**: Exportar resultados a PDF/Excel

### Mejoras Técnicas
- [ ] **Caching**: Redis para cache de resultados
- [ ] **Database**: PostgreSQL para persistencia
- [ ] **Authentication**: Sistema de usuarios
- [ ] **Rate Limiting**: Límites de uso por usuario
- [ ] **Monitoring**: Métricas y alertas

## 🤝 Contribuir

### Guía de Contribución
Ver [CONTRIBUTING.md](CONTRIBUTING.md) para la guía completa de contribución.

### Proceso Rápido
1. **Fork** el repositorio
2. **Crear** feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** cambios (`git commit -m '✨ Add some AmazingFeature'`)
4. **Push** al branch (`git push origin feature/AmazingFeature`)
5. **Abrir** Pull Request

### GitHub Features
- **Issues**: Usar templates para bugs y features
- **CI/CD**: Testing automático en cada PR
- **Codespaces**: Desarrollo en la nube
- **Actions**: Workflows automáticos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **FastAPI** - Framework web moderno y rápido
- **OpenAI** - Modelos GPT
- **Anthropic** - Modelos Claude
- **Google** - Modelos Gemini
- **Cursor IDE** - Inspiración para el diseño
- **Stripe** - Inspiración para componentes

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/asertas14/ai-models-comparison-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/asertas14/ai-models-comparison-platform/discussions)
- **Documentación**: [CONTRIBUTING.md](CONTRIBUTING.md)

## 🔗 Enlaces Útiles

- **Repositorio**: https://github.com/asertas14/ai-models-comparison-platform
- **Issues**: https://github.com/asertas14/ai-models-comparison-platform/issues
- **Releases**: https://github.com/asertas14/ai-models-comparison-platform/releases
- **Actions**: https://github.com/asertas14/ai-models-comparison-platform/actions

---

**Desarrollado con ❤️ para la comunidad de AI/ML**
