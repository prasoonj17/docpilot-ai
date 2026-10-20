
import os
import numpy as np
from google import genai
from google.genai import types

client = genai.Client(
    api_key=os.environ["GEMINI_API_KEY"]
)

MODEL_NAME = "gemini-embedding-001"
EMBEDDING_DIMENSION = 768


def get_embeddings(
    texts: list[str],
    task_type: str = "RETRIEVAL_QUERY",
) -> np.ndarray:

    if not texts:
        return np.empty(
            (0, EMBEDDING_DIMENSION),
            dtype=np.float32,
        )

    vectors = []

    for text in texts:
        result = client.models.embed_content(
            model=MODEL_NAME,
            contents=text,
            config=types.EmbedContentConfig(
                task_type=task_type,
                output_dimensionality=EMBEDDING_DIMENSION,
            ),
        )

        vectors.append(result.embeddings[0].values)

    return np.asarray(vectors, dtype=np.float32)
