from pypdf import PdfReader
from sqlalchemy.orm import Session
# Adjust model import to your project model (e.g. Document, File, etc.)
from app.models.document import Document

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