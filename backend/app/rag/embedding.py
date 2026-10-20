
from app.services.embedding_service import get_embeddings


def create_embeddings(chunks: list[str]):
    return get_embeddings(
        chunks,
        task_type="RETRIEVAL_DOCUMENT",
    )
