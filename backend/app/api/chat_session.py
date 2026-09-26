from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.core.security import get_current_user

from app.services.chat_session_service import (
    create_chat_session,
    get_user_sessions
)

from pydantic import BaseModel
from app.services.chat_session_service import (
    create_chat_session,
    get_user_sessions,
    update_chat_title,
    delete_session
)

class RenameRequest(BaseModel):
    title:str

router = APIRouter(

    prefix="/chat-session",

    tags=["Chat Session"]

)


@router.post("/")
def create_session(

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    session = create_chat_session(

        db=db,

        user_id=current_user["user_id"]

    )

    return session


@router.get("/")
def list_sessions(

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    return get_user_sessions(

        db=db,

        user_id=current_user["user_id"]

    )


@router.put("/{session_id}")

def rename_chat(

    session_id:int,

    request:RenameRequest,

    db:Session=Depends(get_db),

    current_user=Depends(get_current_user)

):

    return update_chat_title(

        db=db,

        session_id=session_id,

        title=request.title

    )


@router.delete("/{session_id}")
def delete_chat(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    delete_session(
        db=db,
        session_id=session_id
    )

    return {
        "message": "Chat deleted successfully"
    }