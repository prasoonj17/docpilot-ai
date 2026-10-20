import faiss
import numpy as np
import os

INDEX_PATH = "storage/vectors/faiss.index"


# def save_index(
#     embeddings,
#     chunk_ids
# ):

#     os.makedirs(
#         "storage/vectors",
#         exist_ok=True
#     )

#     dimension = embeddings.shape[1]

#     # Load Existing Index
#     if os.path.exists(INDEX_PATH):

#         index = faiss.read_index(
#             INDEX_PATH
#         )

#     else:

#         base_index = faiss.IndexFlatL2(
#             dimension
#         )

#         index = faiss.IndexIDMap(
#             base_index
#         )

#     # Add New Embeddings
#     index.add_with_ids(

#         embeddings.astype(np.float32),

#         np.array(chunk_ids, dtype=np.int64)

#     )

#     # Save Updated Index
#     faiss.write_index(

#         index,

#         INDEX_PATH

#     )


def delete_vectors(chunk_ids):

    if not os.path.exists(INDEX_PATH):
        return

    index = faiss.read_index(INDEX_PATH)

    index.remove_ids(
        np.array(chunk_ids, dtype=np.int64)
    )

    faiss.write_index(
        index,
        INDEX_PATH
    )



def save_index(embeddings, chunk_ids, rebuild=False):
    os.makedirs("storage/vectors", exist_ok=True)

    embeddings = np.asarray(embeddings, dtype=np.float32)
    chunk_ids = np.asarray(chunk_ids, dtype=np.int64)

    if len(embeddings) == 0:
        return

    dimension = embeddings.shape[1]

    if rebuild or not os.path.exists(INDEX_PATH):
        index = faiss.IndexIDMap(
            faiss.IndexFlatL2(dimension)
        )
    else:
        index = faiss.read_index(INDEX_PATH)

        if index.d != dimension:
            raise ValueError(
                f"Dimension mismatch: index={index.d}, "
                f"embeddings={dimension}. Rebuild required."
            )

        # Avoid duplicate IDs when re-indexing existing chunks.
        index.remove_ids(chunk_ids)

    index.add_with_ids(embeddings, chunk_ids)
    faiss.write_index(index, INDEX_PATH)
