from services.search_service import SearchService
from services.llm_service import LLMService
from prompts.rag_prompt import RAG_PROMPT

try:
    from services.metadata_service import MetadataService
except ModuleNotFoundError:
    from backend.services.metadata_service import MetadataService


class RAGService:

    def __init__(self):
        self.search = SearchService()
        self.llm = LLMService()

    def answer(self, question, filename=None):
        metadata_context = ""
        if filename:
            metadata_service = MetadataService()
            metadata = metadata_service.load_by_filename(filename)
            if metadata:
                metadata_context = (
                    "Document Metadata:\n"
                    f"- Pages: {metadata.get('pages', 'N/A')}\n"
                    f"- Chunks: {metadata.get('chunks', 'N/A')}\n"
                    f"- Images: {metadata.get('images', 'N/A')}\n"
                    f"- Tables: {metadata.get('tables', 'N/A')}\n"
                    f"- Figures: {metadata.get('figures', 'N/A')}\n"
                    f"- Graphs: {metadata.get('graphs', 'N/A')}\n"
                    f"- File size: {metadata.get('file_size', 'N/A')} bytes\n"
                    f"- Uploaded at: {metadata.get('uploaded_at', 'N/A')}\n\n"
                )

        results = self.search.search(
            question,
            filename
        )

        # Safely extract documents — ChromaDB returns [[...]] on success
        # and [[]] on no results.
        raw_docs = results.get("documents", [[]])
        documents = raw_docs[0] if raw_docs else []

        # If they ask about tables or images, guarantee we pull some of those elements
        q_lower = question.lower()
        element_type = None
        if "table" in q_lower:
            element_type = "table"
        elif "image" in q_lower or "figure" in q_lower or "graph" in q_lower:
            element_type = "image"

        if element_type:
            extra_results = self.search.search(
                question,
                filename,
                top_k=10,
                element_type=element_type
            )
            extra_docs = extra_results.get("documents", [[]])
            for doc in (extra_docs[0] if extra_docs else []):
                if doc not in documents:
                    documents.append(doc)

        if not documents and not metadata_context:
            # No context at all — skip the RAG prompt and answer directly
            fallback_prompt = (
                f"The user asked: {question}\n\n"
                "No relevant document content was found in the knowledge base. "
                "Answer helpfully from general knowledge and note the source."
            )
            return self.llm.generate_answer(fallback_prompt)

        context = metadata_context
        if documents:
            context += "\n\n".join(documents)
        else:
            context += "No relevant document text segments were found for this query."

        prompt = RAG_PROMPT.format(
            context=context,
            question=question
        )

        return self.llm.generate_answer(prompt)
