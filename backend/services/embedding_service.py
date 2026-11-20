import os

os.environ["HF_HOME"] = "./models"

from core.model_manager import ModelManager


class EmbeddingService:

    def __init__(self):

        self.model = ModelManager.get_embedding_model()

    def generate_embedding(self, text):

        embedding = self.model.encode(
            text,
            normalize_embeddings=True
        )

        return embedding.tolist()

    def generate_embeddings(self, texts):

        embeddings = self.model.encode(
            texts,
            normalize_embeddings=True
        )

        return embeddings.tolist()
