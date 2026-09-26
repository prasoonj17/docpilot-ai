from langgraph.graph import StateGraph, START, END

from app.graph.state import RAGState

from app.graph.nodes import (
    retrieve_node,
    generate_node,
    check_context,
    no_context_node
)


graph_builder = StateGraph(RAGState)


graph_builder.add_node(
    "retrieve",
    retrieve_node
)

graph_builder.add_node(
    "generate",
    generate_node
)

graph_builder.add_node(
    "no_context",
    no_context_node
)


graph_builder.add_edge(
    START,
    "retrieve"
)


graph_builder.add_conditional_edges(
    "retrieve",
    check_context,
    {
        "generate": "generate",
        "no_context": "no_context"
    }
)


graph_builder.add_edge(
    "generate",
    END
)

graph_builder.add_edge(
    "no_context",
    END
)


rag_graph = graph_builder.compile()