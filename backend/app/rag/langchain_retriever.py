from typing import List

from langchain_core.documents import Document as LCDocument
from langchain_core.retrievers import BaseRetriever
from pydantic import ConfigDict

from app.rag.retriever import hybrid_search


class DocPilotRetriever(BaseRetriever):

    model_config = ConfigDict(arbitrary_types_allowed=True)

    k: int = 3
    document_ids: list[int] | None = None

    def _get_relevant_documents(self, query: str) -> List[LCDocument]:

        results = hybrid_search(
            query=query,
            k=self.k,
            document_ids=self.document_ids
        )

        documents = []

        for item in results:

            documents.append(
                LCDocument(
                    page_content=item["chunk"],
                    metadata=item["metadata"]
                )
            )

        return documents