import faiss
import numpy as np
import os

INDEX_PATH = "storage/vectors/faiss.index"


def save_index(
    embeddings,
    chunk_ids
):

    os.makedirs(
        "storage/vectors",
        exist_ok=True
    )

    dimension = embeddings.shape[1]

    # Load Existing Index
    if os.path.exists(INDEX_PATH):

        index = faiss.read_index(
            INDEX_PATH
        )

    else:

        base_index = faiss.IndexFlatL2(
            dimension
        )

        index = faiss.IndexIDMap(
            base_index
        )

    # Add New Embeddings
    index.add_with_ids(

        embeddings.astype(np.float32),

        np.array(chunk_ids, dtype=np.int64)

    )

    # Save Updated Index
    faiss.write_index(

        index,

        INDEX_PATH

    )

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