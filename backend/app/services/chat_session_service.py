from sqlalchemy.orm import Session

from app.models.chat_session import ChatSession

from app.models.chat_session import ChatSession
def create_chat_session(
    db: Session,
    user_id: int,
    title: str = "New Chat"
):

    session = ChatSession(

        user_id=user_id,

        title=title

    )

    db.add(session)

    db.commit()

    db.refresh(session)

    return session


def get_user_sessions(
    db: Session,
    user_id: int
):

    return (

        db.query(ChatSession)

        .filter(ChatSession.user_id == user_id)

        .order_by(ChatSession.created_at.desc())

        .all()

    )

def update_chat_title(
    db,
    session_id: int,
    title: str
):

    session = (

        db.query(ChatSession)

        .filter(ChatSession.id == session_id)

        .first()

    )

    if session:

        session.title = title

        db.commit()

        db.refresh(session)

    return session


def delete_session(
    db,
    session_id: int
):

    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id)
        .first()
    )

    if session:

        db.delete(session)

        db.commit()