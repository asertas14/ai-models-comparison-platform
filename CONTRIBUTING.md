# Contributing to AI Models Comparison Platform

¡Gracias por tu interés en contribuir! 🎉

## 🚀 Cómo Contribuir

### 1. Fork del Repositorio
1. Haz fork del repositorio
2. Clona tu fork localmente
3. Crea una nueva rama para tu feature

### 2. Configuración de Desarrollo

```bash
# Clonar tu fork
git clone https://github.com/TU-USUARIO/ai-models-comparison-platform.git
cd ai-models-comparison-platform

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus API keys
```

### 3. Estructura del Proyecto

#### Backend (Modular)
```
app/
├── llm/                 # Módulo LLM genérico
├── summarization/       # Módulo de resúmenes
└── config.py           # Configuración global
```

#### Frontend (Modular)
```
static/
├── css/modules/        # CSS por módulo
├── js/modules/         # JS por módulo
└── js/core/           # Core compartido
```

### 4. Agregar Nuevo Módulo

Para agregar un nuevo módulo (ej: `classification`):

#### Backend:
1. Crear `app/classification/`
2. Implementar:
   - `config.py` - Configuración específica
   - `models.py` - Modelos Pydantic
   - `service.py` - Lógica de negocio
   - `router.py` - Endpoints API
3. Agregar router en `main.py`

#### Frontend:
1. Crear `static/js/modules/classification/`
2. Implementar:
   - `index.js` - Lógica del módulo
3. Crear `static/css/modules/classification.css`
4. Agregar navegación en `templates/dashboard.html`

### 5. Estándares de Código

#### Python:
- **PEP 8** para estilo
- **Type hints** obligatorios
- **Docstrings** para funciones públicas
- **Async/await** para operaciones I/O

#### JavaScript:
- **ES6+** syntax
- **Modular** por dominio
- **Comentarios** para funciones complejas
- **Naming conventions** descriptivos

#### CSS:
- **Variables CSS** para temas
- **Mobile-first** responsive design
- **Modular** por componente
- **BEM methodology** cuando sea apropiado

### 6. Testing

```bash
# Probar imports
python -c "from app.config import settings; print('✅ Config OK')"

# Probar APIs
curl http://localhost:8000/health
curl http://localhost:8000/llm/models

# Probar funcionalidad
python -c "
import asyncio
from app.summarization.service import summarization_service
# Test code here
"
```

### 7. Pull Request Process

1. **Crear rama feature**:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Hacer cambios** siguiendo los estándares

3. **Commit descriptivo**:
   ```bash
   git commit -m "✨ Add classification module
   
   - Implement text classification service
   - Add frontend components
   - Update navigation and routing
   - Add tests and documentation"
   ```

4. **Push y crear PR**:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

5. **Crear Pull Request** con:
   - Título descriptivo
   - Descripción detallada
   - Screenshots si aplica
   - Lista de cambios

### 8. Tipos de Contribuciones

#### 🐛 **Bug Fixes**
- Corregir errores existentes
- Mejorar manejo de errores
- Optimizar performance

#### ✨ **Nuevas Funcionalidades**
- Nuevos módulos (classification, extraction, etc.)
- Nuevos proveedores LLM
- Mejoras de UI/UX

#### 📚 **Documentación**
- Mejorar README
- Agregar ejemplos
- Documentar APIs

#### 🧪 **Testing**
- Agregar tests unitarios
- Tests de integración
- Tests de performance

### 9. Reportar Issues

Usa los templates de issues:
- **Bug Report**: Para errores
- **Feature Request**: Para nuevas funcionalidades

### 10. Código de Conducta

- Sé respetuoso y constructivo
- Ayuda a otros contributors
- Mantén las discusiones enfocadas en el proyecto
- Reporta comportamiento inapropiado

## 📞 Contacto

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: [tu-email@ejemplo.com]

¡Gracias por contribuir! 🙏
