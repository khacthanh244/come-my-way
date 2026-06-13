"""Deployment entrypoint for AgentBase Runtime.

Wraps the existing FastAPI app without modifying it:
- adds root GET /health (required by the runtime)
- serves the built frontend (copied to backend/static in the Docker image)
"""
from pathlib import Path

from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import Response
from fastapi.staticfiles import StaticFiles

from app.main import app


@app.get("/health")
async def _runtime_health():
    return {"status": "ok"}


_static_dir = Path(__file__).resolve().parent.parent / "static"


class _SPAStaticFiles(StaticFiles):
    """Serve static files, falling back to index.html for client-side routes
    (e.g. /mc, /dev) so the SPA router can handle them instead of 404."""

    async def get_response(self, path: str, scope) -> Response:
        try:
            return await super().get_response(path, scope)
        except StarletteHTTPException as exc:
            if exc.status_code == 404:
                return await super().get_response("index.html", scope)
            raise


if _static_dir.is_dir():
    app.mount("/", _SPAStaticFiles(directory=_static_dir, html=True), name="static")
