from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.config import settings
from app.llm.router import router as llm_router
from app.summarization.router import router as summarization_router

# Crear aplicación FastAPI
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug
)

# Configurar CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar archivos estáticos y templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Incluir routers
app.include_router(llm_router)
app.include_router(summarization_router)

@app.get("/")
async def dashboard(request: Request):
    """Dashboard principal"""
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "app_name": settings.app_name,
        "app_version": settings.app_version
    })

@app.get("/api")
async def api_info():
    """Información de la API"""
    return {
        "message": f"Bienvenido a {settings.app_name}",
        "version": settings.app_version,
        "debug": settings.debug
    }

@app.get("/health")
async def health_check():
    """Health check del sistema"""
    from app.config import get_available_providers
    
    return {
        "status": "healthy",
        "available_providers": get_available_providers(),
        "config": {
            "host": settings.host,
            "port": settings.port,
            "debug": settings.debug
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
