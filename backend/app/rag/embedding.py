# from sentence_transformers import SentenceTransformer

# model = SentenceTransformer(
#     "all-MiniLM-L6-v2"
# )

# def create_embeddings(chunks):

#     embeddings = model.encode(
#         chunks,
#         convert_to_numpy=True
#     )

#     return embeddings

from app.services.embedding_service import get_embeddings

def create_embeddings(chunks: list[str]):
    return get_embeddings(chunks)