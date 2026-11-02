from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.endpoints import auth, users, content, dashboard, billing
from app.api.v1.endpoints import rag, models
from app.core.config import settings
from app.database.session import init_db
from app.services.agents.bootstrap import bootstrap_agent_system
from app.utils.exceptions import (
    generic_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.utils.logging import setup_logging
import logging

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version='0.1.0',
    description='Backend API for AI Content Writer SaaS.',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


@app.on_event("startup")
async def startup_event():
    """Bootstrap agent and workflow system on app startup."""
    try:
        await init_db()
        bootstrap_agent_system()
        logger.info("✓ Agent system initialized successfully")
    except Exception as exc:
        logger.error(f"Failed to initialize agent system: {exc}", exc_info=True)
        raise


app.include_router(auth.router, prefix='/api/auth', tags=['auth'])
app.include_router(users.router, prefix='/api/v1/users', tags=['users'])
app.include_router(content.router, prefix='/api/v1/content', tags=['content'])
app.include_router(billing.router, prefix='/api/v1/billing', tags=['billing'])
app.include_router(dashboard.router, prefix='/api/v1/dashboard', tags=['dashboard'])
app.include_router(rag.router, prefix='/api/v1/rag', tags=['rag'])
app.include_router(models.router, prefix='/api/models', tags=['models'])

@app.get('/api/health', summary='Health check')
async def health_check():
    return {'status': 'ok'}
