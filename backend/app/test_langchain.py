from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import os
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")

prompt = ChatPromptTemplate.from_template("""
You are a helpful AI assistant.

Answer only using the provided context.

Context:
{context}

Question:
{question}
""")

llm = ChatOpenAI(
    model="openai/gpt-4o-mini",
    api_key=API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

chain = prompt | llm

response = chain.invoke({
    "context": "RAG combines retrieval with generation.",
    "question": "What is RAG?"
})

print(response.content)