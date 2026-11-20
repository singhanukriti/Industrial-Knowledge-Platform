try:
    from core.services import Services
except ModuleNotFoundError:
    from backend.core.services import Services


class SearchService:

    def search(self, question, filename=None, top_k=10, element_type=None):

        query_embedding = Services.embedder.generate_embedding(
            question
        )

        results = Services.chroma.search(
            query_embedding=query_embedding,
            filename=filename,
            top_k=top_k,
            element_type=element_type
        )

        return results
