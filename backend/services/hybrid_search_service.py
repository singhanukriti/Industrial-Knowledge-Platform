try:
    from core.services import Services
except ModuleNotFoundError:
    from backend.core.services import Services


class HybridSearchService:

    def search(self, question, top_k=10):

        query_embedding = Services.embedder.generate_embedding(
            question
        )

        results = Services.chroma.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=[
                "documents",
                "metadatas",
                "distances"
            ]
        )

        grouped = {
            "text": [],
            "table": [],
            "image": []
        }

        documents = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results["distances"][0]

        for doc, meta, score in zip(
            documents,
            metadatas,
            distances
        ):

            item = {
                "document": doc,
                "metadata": meta,
                "score": score
            }

            element_type = meta.get("type") or meta.get("element_type") or "text"

            grouped.setdefault(
                element_type,
                []
            ).append(item)

        return grouped
