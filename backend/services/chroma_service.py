import chromadb
from chromadb.config import Settings


class ChromaService:

    def __init__(self):

        self.client = chromadb.PersistentClient(
            path="./chroma_db"
        )

        self.collection = self.client.get_or_create_collection(
            name="industrial_documents"
        )

    def add_documents(self, chunks, embeddings, source, document_id, batch, file_hash, element_type="text", clear_existing=False, chunk_offset=0):

        # Deletion is handled externally (once per document). No per-batch delete.
        ids = []
        metadatas = []
        for i in range(len(chunks)):
            ids.append(f"{document_id}_{batch}_{chunk_offset + i}")
            metadatas.append({
                "document_id": document_id,
                "source": source,
                "batch": batch,
                "chunk": chunk_offset + i,
                "file_hash": file_hash,
                "element_type": element_type,
            })

        self.collection.upsert(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas
        )

    def document_exists(self, file_hash):

        results = self.collection.get(
            where={
                "file_hash": file_hash
            }
        )

        return len(results["ids"]) > 0

    def delete_document(self, document_id, source=None, file_hash=None):
        """Delete all entries belonging to a specific document."""
        ids_to_delete = set()

        try:
            results = self.collection.get(where={"document_id": document_id})
            ids_to_delete.update(results.get("ids", []))
        except Exception as e:
            print(f"[ChromaDB] get by document_id error: {e}")

        if source:
            try:
                results = self.collection.get(where={"source": source})
                ids_to_delete.update(results.get("ids", []))
            except Exception as e:
                print(f"[ChromaDB] get by source error: {e}")
            try:
                results = self.collection.get(where={"source": f"{source}_elements"})
                ids_to_delete.update(results.get("ids", []))
            except Exception as e:
                print(f"[ChromaDB] get by source_elements error: {e}")

        if file_hash:
            try:
                results = self.collection.get(where={"file_hash": file_hash})
                ids_to_delete.update(results.get("ids", []))
            except Exception as e:
                print(f"[ChromaDB] get by file_hash error: {e}")

        print(f"[ChromaDB] Total IDs collected for deletion: {len(ids_to_delete)}")

        if ids_to_delete:
            try:
                self.collection.delete(ids=list(ids_to_delete))
                print(f"[ChromaDB] Successfully deleted {len(ids_to_delete)} chunks")
            except Exception as e:
                print(f"[ChromaDB] delete by ids error: {e}")
        else:
            print("[ChromaDB] No chunks found to delete")

    def count(self):

        return self.collection.count()

    def search(self, query_embedding, filename=None, top_k=10, element_type=None):
        """
        Search similar chunks.
        If filename is provided, search only inside that document. Legacy
        table/figure chunks may be stored under a "<filename>_elements"
        source, so both are matched.
        """

        if filename:

            where_clause = {
                "$or": [
                    {"source": filename},
                    {"source": f"{filename}_elements"},
                ]
            }
            if element_type:
                where_clause = {
                    "$and": [
                        where_clause,
                        {"element_type": element_type}
                    ]
                }

            # Count how many chunks exist for this document first so we
            # never ask for more results than exist (ChromaDB raises an
            # error if n_results > number of matching documents).
            try:
                existing = self.collection.get(where=where_clause)
                available = len(existing.get("ids", []))
            except Exception:
                available = 0

            if available == 0:
                # Document not indexed yet or filename mismatch —
                # fall back to a global search so the user still gets
                # an answer rather than an empty context.
                print(f"[ChromaDB] No chunks found for '{filename}', falling back to global search")
                try:
                    return self.collection.query(
                        query_embeddings=[query_embedding],
                        n_results=min(top_k, self.collection.count() or 1),
                        where={"element_type": element_type} if element_type else None
                    )
                except Exception as e:
                    print(f"[ChromaDB] Global search fallback error: {e}")
                    return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

            clamped_k = min(top_k, available)

            try:
                results = self.collection.query(
                    query_embeddings=[query_embedding],
                    n_results=clamped_k,
                    where=where_clause
                )
                return results
            except Exception as e:
                print(f"[ChromaDB] Filtered search error: {e}, falling back to global search")
                try:
                    return self.collection.query(
                        query_embeddings=[query_embedding],
                        n_results=min(top_k, self.collection.count() or 1)
                    )
                except Exception as e2:
                    print(f"[ChromaDB] Global search fallback error: {e2}")
                    return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

        else:

            total = self.collection.count()
            if total == 0:
                return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

            try:
                return self.collection.query(
                    query_embeddings=[query_embedding],
                    n_results=min(top_k, total),
                    where={"element_type": element_type} if element_type else None
                )
            except Exception as e:
                print(f"[ChromaDB] Global search error: {e}")
                return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
