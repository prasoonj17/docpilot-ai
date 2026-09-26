from app.graph.graph import rag_graph


result = rag_graph.invoke({

    "question": "What is RAG?",

    "context": "",

    "history": [],

    "answer": ""

})


print("ANSWER:")
print(result["answer"])