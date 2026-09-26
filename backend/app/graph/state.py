from typing import TypedDict


class RAGState(TypedDict):

    question: str
    context: str
    history: list
    answer: str
    document_ids: list[int] | None
    documents: list
    has_context: bool