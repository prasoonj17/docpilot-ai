from app.services.document_service import extract_text
from app.rag.chunking import chunk_text
from app.rag.embedding import create_embeddings
from app.rag.faiss_store import save_index

from app.models.chunk import DocumentChunk
from app.models.document import Document

from app.database.database import SessionLocal


def process_document(document_id: int, file_path: str):

    db = SessionLocal()

    try:
        # Step 1 - Extract Text
        text = extract_text(file_path)

        # Step 2 - Create Chunks
        chunks = chunk_text(text)

        # Step 3 - Save Chunks in Database
        for index, chunk in enumerate(chunks):

            db_chunk = DocumentChunk(
                document_id=document_id,
                chunk_text=chunk,
                page_number=1,          # TODO: Extract actual page number later
                chunk_index=index
            )

            db.add(db_chunk)

        db.commit()

        # Step 4 - Read Saved Chunks
        db_chunks = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document_id)
            .all()
        )

        # Step 5 - Create Metadata
        # metadata = []

        # for chunk in db_chunks:

        #     metadata.append(
        #         {
        #             "chunk_id": chunk.id,
        #             "document_id": chunk.document_id,
        #             "page": chunk.page_number,
        #             "chunk_index": chunk.chunk_index
        #         }
        #     )
        chunk_ids = [
            chunk.id
            for chunk in db_chunks
        ]

        # Step 6 - Create Embeddings
        embeddings = create_embeddings(chunks)

        # Step 7 - Save FAISS Index
        

        save_index(
            embeddings,
            chunk_ids
        )

        # Step 8 - Update Document Status
        document = (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

        if document:
            document.status = "completed"
            db.commit()

        print("Document Indexed Successfully")

    except Exception as e:

        db.rollback()

        document = (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

        if document:
            document.status = "failed"
            db.commit()

        print(f"Error: {e}")

    finally:

        db.close()