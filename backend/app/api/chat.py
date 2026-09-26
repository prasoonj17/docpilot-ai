from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.security import get_current_user

from app.graph.graph import rag_graph

from app.services.chat_service import (
    save_message,
    get_chat_history
)

from app.services.chat_session_service import (
    update_chat_title
)


router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


class ChatRequest(BaseModel):

    session_id: int

    question: str

    document_ids: Optional[list[int]] = None


@router.post("/")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # 1. Save User Message

    save_message(
        db=db,
        user_id=current_user["user_id"],
        role="user",
        session_id=request.session_id,
        message=request.question
    )


    # 2. Get Chat History

    history = get_chat_history(
        db=db,
        session_id=request.session_id
    )


    # 3. Create Chat Title

    if len(history) == 1:

        title = request.question[:40]

        update_chat_title(
            db=db,
            session_id=request.session_id,
            title=title
        )


    # 4. Prepare Conversation History

    history_messages = []

    for chat in history[:-1]:

        history_messages.append(
            {
                "role": chat.role,
                "content": chat.message
            }
        )


    # 5. Run LangGraph

    result = rag_graph.invoke({

        "question": request.question,

        "context": "",

        "history": history_messages,

        "answer": "",

        "document_ids": request.document_ids,

        "documents": []

    })


    # 6. Get Answer

    answer = result["answer"]


    # 7. Get Retrieved Documents

    documents = result["documents"]


    # 8. Save AI Response

    save_message(
        db=db,
        user_id=current_user["user_id"],
        session_id=request.session_id,
        role="assistant",
        message=answer
    )


    # 9. Create Citations

    citations = []

    seen = set()

    for doc in documents:

        source = {
            "document": doc.metadata["document_name"],
            "page": doc.metadata["page"]
        }

        key = (
            source["document"],
            source["page"]
        )

        if key not in seen:

            citations.append(source)

            seen.add(key)


    # 10. Return Response

    return {
        "answer": answer,
        "citations": citations
    }