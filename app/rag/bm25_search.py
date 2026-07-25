from rank_bm25 import BM25Okapi

from app.database.database import SessionLocal
from app.models.chunk import DocumentChunk
from app.models.document import Document


def bm25_search(
    query: str,
    k: int = 3,
    document_ids: list[int] | None = None
):

    db = SessionLocal()

    try:

        # Step 1 - Read All Chunks From DB
        rows = (
            db.query(
                DocumentChunk,
                Document
            )
            .join(
                Document,
                DocumentChunk.document_id == Document.id
            )
            .all()
        )

        if not rows:
            return []

        # Step 2 - Prepare BM25 Corpus
        chunks = [
            chunk.chunk_text
            for chunk, _ in rows
        ]

        tokenized_chunks = [
            chunk.split()
            for chunk in chunks
        ]

        bm25 = BM25Okapi(tokenized_chunks)

        # Step 3 - Search
        tokens = query.split()

        scores = bm25.get_scores(tokens)

        ranked = sorted(
            enumerate(scores),
            key=lambda x: x[1],
            reverse=True
        )

        # Step 4 - Return Top K
        results = []

        for index, score in ranked[:k]:

            chunk, document = rows[index]

            results.append(
                {
                    "chunk": chunk.chunk_text,
                    "metadata": {
                        "chunk_id": chunk.id,
                        "document_id": chunk.document_id,
                        "document_name": document.title,
                        "page": chunk.page_number,
                        "chunk_index": chunk.chunk_index,
                        "score": float(score)
                    }
                }
            )

        return results

    finally:

        db.close()