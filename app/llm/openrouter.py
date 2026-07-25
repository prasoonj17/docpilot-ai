import os
import requests
from dotenv import load_dotenv
from openai import OpenAI
load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")

URL = "https://openrouter.ai/api/v1/chat/completions"


def ask_llm(
    history: str,
    context: str,
    question: str
):

    prompt = f"""
You are an AI Assistant for document question answering.

## Rules

1. Answer ONLY from the provided context.
2. Never make up information.
3. If the answer is not found, reply:
   "I don't know based on the uploaded documents."
4. Keep the answer short and clear.
5. If multiple chunks contain the answer, combine them naturally.
6. Do not mention internal implementation like FAISS, embeddings or chunks.

----------------------------

Conversation History:
{history}

----------------------------

Document Context:
{context}

----------------------------

User Question:
{question}
"""

    response = requests.post(

        URL,

        headers={

            "Authorization": f"Bearer {API_KEY}",

            "Content-Type": "application/json"

        },

        json={

            "model": "openai/gpt-4o-mini",

            "messages": [

                {

                    "role": "user",

                    "content": prompt

                }

            ]

        }

    )

    return response.json()["choices"][0]["message"]["content"]