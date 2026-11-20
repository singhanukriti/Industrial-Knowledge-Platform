import os

try:
    from core.services import Services
    from services.pipeline.base_stage import PipelineStage
except ModuleNotFoundError:
    from backend.core.services import Services
    from backend.services.pipeline.base_stage import PipelineStage


class ElementIndexStage(PipelineStage):
    def process(self, context):
        if not context.elements:
            print("No document elements to index.")
            return context

        print("Indexing document elements...")
        source = os.path.basename(context.pdf_path)
        element_offset = getattr(context, "element_offset", 0)
        document_id = getattr(context, "document_id", source)
        batch_num = getattr(context, "batch_num", 0)

        try:
            from utils.hash_utils import HashUtils
        except ModuleNotFoundError:
            from backend.utils.hash_utils import HashUtils
        file_hash = HashUtils.sha256(context.pdf_path)

        chunks = []
        embeddings = []
        metadatas = []
        for element in context.elements:
            if element.element_type == "image":
                document_text = element.caption
            else:
                document_text = element.content

            embeddings.append(element.embedding)
            chunks.append(document_text)
            metadatas.append({
                "document_id": document_id,
                "type": element.element_type,
                "element_type": element.element_type,
                "source": source,
                "path": element.content if element.element_type == "image" else "",
                "caption": getattr(element, "caption", ""),
                "file_hash": file_hash
            })

        Services.chroma.collection.upsert(
            ids=[f"{document_id}_elem_{batch_num}_{element_offset + i}" for i in range(len(chunks))],
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
        )

        print(f"Indexed {len(chunks)} document element(s).")
        return context
