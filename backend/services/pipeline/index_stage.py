import os

try:
    from core.services import Services
    from services.pipeline.base_stage import PipelineStage
except ModuleNotFoundError:
    from backend.core.services import Services
    from backend.services.pipeline.base_stage import PipelineStage


class IndexStage(PipelineStage):

    def process(self, context):

        print("Saving to ChromaDB...")
        
        # Handle both dict and dataclass contexts for compatibility
        if isinstance(context, dict):
            pdf_path = context.get("pdf_path", "")
            chunks = context.get("chunks", [])
            embeddings = context.get("embeddings", [])
        else:
            pdf_path = context.pdf_path
            chunks = context.chunks
            embeddings = context.embeddings

        source = os.path.basename(pdf_path)

        try:
            from utils.hash_utils import HashUtils
        except ModuleNotFoundError:
            from backend.utils.hash_utils import HashUtils
        file_hash = HashUtils.sha256(pdf_path)

        chunk_offset = getattr(context, "chunk_offset", 0)
        document_id = getattr(context, "document_id", source)
        batch_num = getattr(context, "batch_num", 0)

        Services.chroma.add_documents(
            chunks=chunks,
            embeddings=embeddings,
            source=source,
            document_id=document_id,
            batch=batch_num,
            file_hash=file_hash,
            element_type="text",
            chunk_offset=chunk_offset,
        )

        print("Document Indexed Successfully!")

        return context
