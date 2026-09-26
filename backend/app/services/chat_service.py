from sqlalchemy.orm import Session

from app.models.chat_history import ChatHistory


def save_message(
    db: Session,
    user_id: int,
    role: str,
    message: str,
    session_id: int,
):

    chat = ChatHistory(

        user_id=user_id,

        role=role,
        session_id=session_id,
        message=message

    )

    db.add(chat)

    db.commit()

    db.refresh(chat)

    return chat


def get_chat_history(
    db: Session,
    session_id: int,
    limit: int = 6
):

    chats = (

        db.query(ChatHistory)

        .filter(ChatHistory.session_id == session_id)

        .order_by(ChatHistory.created_at.desc())

        .limit(limit)

        .all()

    )

    chats.reverse()

    return chats