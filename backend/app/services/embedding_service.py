import os
import requests
import numpy as np

# Free Hugging Face serverless router endpoint for all-MiniLM-L6-v2
API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"

def get_embeddings(texts: list[str]) -> np.ndarray:
    hf_token = os.getenv("HF_TOKEN")
    headers = {"Content-Type": "application/json"}
    if hf_token:
        headers["Authorization"] = f"Bearer {hf_token.strip()}"

    payload = {"inputs": texts}
    response = requests.post(API_URL, headers=headers, json=payload, timeout=60)

    if response.status_code != 200:
        raise RuntimeError(f"Hugging Face API error ({response.status_code}): {response.text}")

    data = response.json()
    return np.array(data, dtype=np.float32)