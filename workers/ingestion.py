from celery import Celery
import os

celery_app = Celery(
    'salesfortis_workers',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0')
)

@celery_app.task
def process_document(document_id: str):
    """Process uploaded document"""
    return {"status": "processed", "document_id": document_id}

@celery_app.task
def run_ml_scoring(tenant_id: str):
    """Run ML scoring for tenant"""
    return {"status": "completed", "tenant_id": tenant_id}

@celery_app.task
def send_notification(user_id: str, message: str):
    """Send notification"""
    return {"status": "sent", "user_id": user_id}
