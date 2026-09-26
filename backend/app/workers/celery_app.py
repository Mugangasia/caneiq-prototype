from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "caneiq",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_track_started=True,
    timezone="Africa/Nairobi",
    beat_schedule={
        # Satellite NDVI ingestion, weather polling, overdue-activity
        # detection and harvest forecasts are registered here as tasks land.
    },
)
