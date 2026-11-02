import logging
from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR

logger = logging.getLogger(__name__)


def raise_not_found(detail: str = 'Resource not found') -> HTTPException:
    return HTTPException(status_code=404, detail=detail)


def raise_bad_request(detail: str = 'Bad request') -> HTTPException:
    return HTTPException(status_code=400, detail=detail)


def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={'detail': exc.detail},
    )


def validation_exception_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={'detail': exc.errors()},
    )


def generic_exception_handler(_request: Request, _exc: Exception) -> JSONResponse:
    logger.exception('Unhandled exception during request processing.')
    return JSONResponse(
        status_code=HTTP_500_INTERNAL_SERVER_ERROR,
        content={'detail': 'Internal server error'},
    )
