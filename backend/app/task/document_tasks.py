from app.celery_app import celery
from app.services.background_service import process_document


@celery.task
def process_document_task(
    document_id: int,
    file_path: str
):
    process_document(
        document_id,
        file_path
    )