from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.security import get_current_user

from app.rag.retriever import hybrid_search
from app.llm.openrouter import ask_llm
# from app.rag.retriever import hybrid_search
from app.services.chat_service import (
    save_message,
    get_chat_history
)
from typing import Optional
router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


class ChatRequest(BaseModel):
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
        message=request.question
    )

    # 2. Get Previous Chat History
    history = get_chat_history(
        db=db,
        user_id=current_user["user_id"]
    )

    history_text = ""

    for chat in history:
        history_text += f"{chat.role}: {chat.message}\n"

    # 3. Retrieve Context
    results = hybrid_search(
        query=request.question,
        document_ids=request.document_ids
    )

    context = "\n\n".join(
        item["chunk"]
        for item in results
    )

    # 4. Ask LLM
    # (History support next step me add karenge)
    answer = ask_llm(
        history=history_text,
        context=context,
        question=request.question
    )

    # 5. Save AI Response
    save_message(
        db=db,
        user_id=current_user["user_id"],
        role="assistant",
        message=answer
    )

    # 6. Return Response
    citations = []

    seen = set()

    for item in results:

        source = {
            "document": item["metadata"]["document_name"],
            "page": item["metadata"]["page"]
        }

        key = (
            source["document"],
            source["page"]
        )

        if key not in seen:
            citations.append(source)
            seen.add(key)

    return {
        "answer": answer,
        "citations": citations
    }