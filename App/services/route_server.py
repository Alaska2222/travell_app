from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
import logging
import math
import json
from .plan_route_core import plan_route

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("route_server")

class RouteRequest(BaseModel):
    experience_level: str
    distance_limit: int | None = None
    peak_limit: int | None = None

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    safe = jsonable_encoder({"status": "error", "detail": str(exc)})
    return JSONResponse(status_code=500, content=safe)

@app.get("/")
async def read_root():
    logger.debug("GET /")
    return {"msg": "Route server is running"}

@app.post("/generate-route")
async def generate_route(req: RouteRequest):
    logger.debug(f"/generate-route called with: {req.json()}")
    result = plan_route(req.dict())
    if result is None:
        logger.debug("No matching route found")
        raise HTTPException(status_code=404, detail="No matching route found")

    for peak in result.get("peaks", []):
        if isinstance(peak.get("elevation"), float) and math.isnan(peak["elevation"]):
            peak["elevation"] = None

    response_data = {"status": "ok", "route": result}
    safe_data = jsonable_encoder(response_data)
    logger.debug("Route generated successfully")
    return JSONResponse(content=safe_data)
