from fastapi import APIRouter

from app.api.v1.endpoints import crop_cycles, farmers, farms, field_queue, health

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(farmers.router)
api_router.include_router(farms.router)
api_router.include_router(crop_cycles.router)
api_router.include_router(field_queue.router)
