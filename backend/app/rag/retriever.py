import faiss
import numpy as np

from collections import defaultdict
from sentence_transformers import SentenceTransformer

from app.database.database import SessionLocal
from app.models.chunk import DocumentChunk
from app.models.document import Document
from app.rag.bm25_search import bm25_search

INDEX_PATH = "storage/vectors/faiss.index"

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

index = faiss.read_index(
    INDEX_PATH
)


def faiss_search(
    query: str,
    k: int = 3,
    document_ids: list[int] | None = None
):

    db = SessionLocal()

    try:

        # Step 1 - Create Query Embedding
        query_embedding = model.encode(
            [query],
            convert_to_numpy=True
        )

        # Step 2 - Search in FAISS
        distances, chunk_ids = index.search(
            query_embedding.astype(np.float32),
            k
        )

        # Step 3 - Convert IDs to Python List
        ids = [
            int(chunk_id)
            for chunk_id in chunk_ids[0]
            if chunk_id != -1
        ]

        if not ids:
            return []

        # Step 4 - Fetch Chunks From DB
        query_db = (
            db.query(
                DocumentChunk,
                Document
            )
            .join(
                Document,
                DocumentChunk.document_id == Document.id
            )
            .filter(
                DocumentChunk.id.in_(ids)
            )
        )

        if document_ids:

            query_db = query_db.filter(
                Document.id.in_(document_ids)
            )

        rows = query_db.all()

        # Step 5 - Preserve FAISS Ranking
        row_map = {
            chunk.id: (chunk, document)
            for chunk, document in rows
        }

        results = []

        for chunk_id in ids:

            if chunk_id not in row_map:
                continue

            chunk, document = row_map[chunk_id]

            results.append(
                {
                    "chunk": chunk.chunk_text,
                    "metadata": {
                        "chunk_id": chunk.id,
                        "document_id": chunk.document_id,
                        "document_name": document.title,
                        "page": chunk.page_number,
                        "chunk_index": chunk.chunk_index
                    }
                }
            )

        return results

    finally:

        db.close()


def hybrid_search(
    query: str,
    k: int = 5,
    document_ids: list[int] | None = None
):

    faiss_results = faiss_search(
        query=query,
        k=k,
        document_ids=document_ids
    )

    bm25_results = bm25_search(
        query=query,
        k=k,
        document_ids=document_ids
    )

    merged_scores = defaultdict(float)
    merged_data = {}

    # FAISS Weight = 2
    for rank, item in enumerate(faiss_results):

        chunk_id = item["metadata"]["chunk_id"]

        merged_scores[chunk_id] += (k - rank) * 2

        merged_data[chunk_id] = item

    # BM25 Weight = 1
    for rank, item in enumerate(bm25_results):

        chunk_id = item["metadata"]["chunk_id"]

        merged_scores[chunk_id] += (k - rank)

        if chunk_id not in merged_data:
            merged_data[chunk_id] = item

    ranked = sorted(
        merged_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )

    results = []

    for chunk_id, _ in ranked[:k]:
        results.append(
            merged_data[chunk_id]
        )

    return results