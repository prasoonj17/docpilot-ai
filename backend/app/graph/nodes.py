from app.graph.state import RAGState
from app.rag.langchain_retriever import DocPilotRetriever
from app.services.llm_service import ask_llm


def check_context(state: RAGState):

    if state["has_context"]:
        return "generate"

    return "no_context"

def no_context_node(state: RAGState):

    return {
        "answer": "I don't know based on the uploaded documents."
    }

def retrieve_node(state: RAGState):

    retriever = DocPilotRetriever(
        k=3,
        document_ids=state["document_ids"]
    )

    documents = retriever.invoke(
        state["question"]
    )

    context = "\n\n".join(
        doc.page_content
        for doc in documents
    )

    return {
        "context": context,
        "documents": documents,
        "has_context": bool(documents)
    }


def generate_node(state: RAGState):

    answer = ask_llm(
        history=state["history"],
        context=state["context"],
        question=state["question"]
    )

    return {
        "answer": answer
    }