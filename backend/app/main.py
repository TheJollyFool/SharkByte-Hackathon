from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import advisors, chat, health
from app.config import get_settings
from app.models.errors import ApiError
from app.swarm.client import get_swarms


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    await get_swarms().aclose()


app = FastAPI(title="Shark Advisor backend", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,
    allow_origin_regex=r"chrome-extension://.*",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _err(status: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"error": {"code": code, "message": message}})


@app.exception_handler(ApiError)
async def api_error_handler(_: Request, exc: ApiError) -> JSONResponse:
    return _err(exc.status, exc.code, exc.message)


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    first = exc.errors()[0] if exc.errors() else {}
    loc = ".".join(str(x) for x in first.get("loc", []))
    return _err(400, "invalid_request", f"{loc}: {first.get('msg', 'invalid body')}")


for r in (health.router, advisors.router, chat.router):
    app.include_router(r)
