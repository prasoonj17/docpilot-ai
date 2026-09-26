import os

from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")


llm = ChatOpenAI(
    model="openai/gpt-4o-mini",
    api_key=API_KEY,
    base_url="https://openrouter.ai/api/v1"
)


prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are DocPilot AI.

Rules:
1. Answer ONLY using the provided document context.
2. Never hallucinate.
3. If answer is not found, say:
"I don't know based on the uploaded documents."
4. Keep answers concise.

Document Context:
{context}
"""
    ),

    MessagesPlaceholder(
        variable_name="history"
    ),

    (
        "human",
        "{question}"
    )
])


chain = (
    prompt
    | llm
    | StrOutputParser()
)


def ask_llm(
    history: list,
    context: str,
    question: str
):

    response = chain.invoke({
        "history": history,
        "context": context,
        "question": question
    })

    return response