import os
import uuid

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.document import Document
from app.core.security import require_role
from fastapi import BackgroundTasks
from app.services.background_service import process_document
from app.models.chunk import DocumentChunk
from app.rag.faiss_store import delete_vectors

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post("/upload")
def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin"))
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF allowed"
        )
    file_id = str(uuid.uuid4())

    filename = f"{file_id}.pdf"

    UPLOAD_FOLDER = "storage/documents"

    os.makedirs(
        UPLOAD_FOLDER,
        exist_ok=True
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    with open(file_path, "wb") as buffer:

        buffer.write(
            file.file.read()
        )

    document = Document(

        title=file.filename,

        file_name=filename,

        file_path=file_path,

        uploaded_by=current_user["user_id"]
    )

    db.add(document)

    db.commit()
    db.refresh(document)
    background_tasks.add_task(

        process_document,

        document.id,

        file_path
    )

    

    return {

    "message":"Uploaded Successfully",

    "document_id":document.id
}


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin"))
):

    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .all()
    )

    chunk_ids = [
        chunk.id
        for chunk in chunks
    ]

    # Delete vectors from FAISS
    if chunk_ids:
        delete_vectors(chunk_ids)

    # Delete chunks from DB
    (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .delete()
    )

    # Delete PDF
    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    # Delete document
    db.delete(document)

    db.commit()

    return {
        "message": "Document deleted successfully"
    }