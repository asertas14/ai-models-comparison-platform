# 🤖 AI Models Comparison Platform

Una plataforma completa para comparar múltiples modelos de LLM (Large Language Models) de forma concurrente, con evaluación automática y métricas detalladas.

## ✨ Características

### 🎯 **Funcionalidades Principales**
- **Comparación Concurrente**: Ejecuta múltiples modelos en paralelo usando `asyncio.gather`
- **Evaluación Automática**: Sistema de evaluación basado en reconstrucción de texto
- **Métricas Detalladas**: Scores de similitud, consistencia y compresión
- **Interfaz Moderna**: Diseño inspirado en Cursor IDE + Stripe
- **Arquitectura Modular**: Fácil extensión para nuevos módulos

### 🔧 **Tecnologías**
- **Backend**: FastAPI + Pydantic + Uvicorn
- **Frontend**: Vanilla JavaScript + CSS Grid + Flexbox
- **LLM Providers**: OpenAI, Anthropic, Google
- **Concurrencia**: `asyncio.gather` para ejecución paralela
- **Deployment**: Vercel + Python

## 🚀 Inicio Rápido

### Prerrequisitos
- Python 3.8+
- API Keys de los proveedores de LLM

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/ai-models-comparison.git
cd ai-models-comparison
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
cp .env.example .env
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
ai-models-comparison/
├── app/                          # Backend FastAPI
│   ├── llm/                      # Módulo LLM
│   │   ├── config.py             # Configuración LLM
│   │   ├── models.py              # Modelos Pydantic
│   │   ├── service.py             # Servicio LLM
│   │   └── router.py              # Rutas API
│   ├── summarization/             # Módulo Summarization
│   │   ├── config.py             # Configuración
│   │   ├── models.py              # Modelos
│   │   ├── service.py             # Servicio
│   │   ├── evaluator.py          # Evaluador
│   │   └── router.py              # Rutas
│   └── config.py                  # Configuración global
├── static/                        # Frontend
│   ├── css/                       # Estilos
│   │   ├── themes/                # Temas (Cursor + Stripe)
│   │   └── modules/                # Estilos por módulo
│   └── js/                        # JavaScript
│       ├── core/                  # Core frontend
│       └── modules/               # Módulos frontend
├── templates/                     # Templates HTML
├── main.py                        # Punto de entrada
├── requirements.txt               # Dependencias
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

## 🔬 Sistema de Evaluación

### Método de Reconstrucción
1. **Generación**: Se generan 5 resúmenes por modelo
2. **Reconstrucción**: Un modelo evaluador intenta reconstruir el texto original
3. **Similitud**: Se calcula la similitud Jaccard entre original y reconstruido
4. **Compresión**: Bonus por resúmenes más cortos que mantengan información
5. **Consistencia**: Mide la consistencia entre los 5 resúmenes

### Métricas
- **Similarity Score**: Qué tan bien reconstruye el texto original
- **Compression Bonus**: Premio por compresión eficiente
- **Consistency Score**: Consistencia entre múltiples resúmenes
- **Execution Time**: Tiempo de ejecución por modelo

## 🚀 Deployment en Vercel

### 1. Preparar para Vercel

Crear `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "main.py"
    }
  ]
}
```

### 2. Variables de Entorno en Vercel
```bash
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add GOOGLE_API_KEY
```

### 3. Deploy
```bash
vercel --prod
```

## 📊 Uso de la Aplicación

### 1. Dashboard
- **Estadísticas**: Modelos disponibles, proveedores activos
- **Acciones Rápidas**: Navegación a módulos
- **Estado del Sistema**: Health check y configuración

### 2. Summarization Module
- **Selección de Modelos**: Filtros por proveedor, búsqueda
- **Configuración LLM**: Temperature, tokens, top-p, top-k
- **Input de Texto**: Textarea con contador de palabras
- **Comparación**: Ejecuta modelos en paralelo
- **Resultados**: Scores, métricas y resúmenes

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

### Pruebas Automáticas
```bash
# Probar API
curl http://localhost:8000/health

# Probar modelos
curl http://localhost:8000/llm/models

# Probar resumen
curl -X POST "http://localhost:8000/summarization/test" \
  -d "text=Test text&model=gpt-3.5-turbo&max_words=20"
```

### Pruebas Manuales
1. **Navegación**: Dashboard → Summarization
2. **Selección**: Filtrar y seleccionar modelos
3. **Comparación**: Texto + modelos seleccionados
4. **Resultados**: Verificar scores y métricas

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

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

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



---

**Desarrollado con ❤️ para la comunidad de AI/ML**
