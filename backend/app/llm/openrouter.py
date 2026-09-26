import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")


llm = ChatOpenAI(
    model="openai/gpt-4o-mini",
    api_key=API_KEY,
    base_url="https://openrouter.ai/api/v1"
)


def ask_llm(messages):

    system_message = {
        "role": "system",
        "content": """
You are DocPilot AI.

Rules:
1. Answer ONLY using the provided document context.
2. Never hallucinate.
3. If answer not found say:
"I don't know based on the uploaded documents."
4. Keep answers concise.
"""
    }

    messages = [
        system_message,
        *messages
    ]

    response = llm.invoke(messages)

    return response.content