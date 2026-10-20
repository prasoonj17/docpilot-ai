from pypdf import PdfReader
from sqlalchemy.orm import Session
# Adjust model import to your project model (e.g. Document, File, etc.)
from app.models.document import Document
from app.database.database import SessionLocal
import numpy as np
from app.models.chunk import DocumentChunk
from app.rag.embedding import create_embeddings
from app.rag.faiss_store import save_index

def extract_text(file_path: str):

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:

        text += page.extract_text() + "\n"

    return text

# text = extract_text(
#     "storage/documents/test.pdf"
# )

# print(text)

def get_all_documents(db: Session):
    """Retrieve all indexed documents sorted by newest first."""
    return db.query(Document).order_by(Document.id.desc()).all()

def delete_document_by_id(db: Session, document_id: int):
    """Delete a document record from the database."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if doc:
        db.delete(doc)
        db.commit()
        return True
    return False


def rebuild_faiss_index():
    db = SessionLocal()

    try:
        # Fetch ALL existing document chunks
        db_chunks = (
            db.query(DocumentChunk)
            .order_by(DocumentChunk.id)
            .all()
        )

        if not db_chunks:
            print("No document chunks found.")
            return

        chunk_ids = [chunk.id for chunk in db_chunks]
        texts = [chunk.chunk_text for chunk in db_chunks]

        # Generate Gemini document embeddings in batches
        all_embeddings = []

        for start in range(0, len(texts), 32):
            batch = texts[start:start + 32]
            embeddings = create_embeddings(batch)
            all_embeddings.append(embeddings)

            print(f"Processed {min(start + 32, len(texts))}/{len(texts)} chunks")

        all_embeddings = np.vstack(all_embeddings)

        # Create a completely new index from all chunks
        save_index(
            all_embeddings,
            chunk_ids,
            rebuild=True
        )

        print("FAISS index rebuilt successfully.")

    except Exception as e:
        print(f"FAISS rebuild failed: {e}")
        raise

    finally:
        db.close()
