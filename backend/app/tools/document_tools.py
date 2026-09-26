from langchain_core.tools import tool

from app.rag.retriever import hybrid_search


@tool
def search_documents(
    query: str,
    document_ids: list[int] | None = None
) -> str:
    """
    Search the uploaded documents using hybrid search
    and return relevant document content.
    """

    results = hybrid_search(
        query=query,
        document_ids=document_ids
    )

    if not results:
        return "No relevant information found in the uploaded documents."

    return "\n\n".join(
        item["chunk"]
        for item in results
    )