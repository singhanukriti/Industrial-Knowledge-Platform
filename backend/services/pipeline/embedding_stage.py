try:
    from core.services import Services
    from services.pipeline.base_stage import PipelineStage
except ModuleNotFoundError:
    from backend.core.services import Services
    from backend.services.pipeline.base_stage import PipelineStage


class EmbeddingStage(PipelineStage):

    def process(self, context):

        print("Generating embeddings...")
        
        # Handle both dict and dataclass contexts for compatibility
        if isinstance(context, dict):
            chunks = context.get("chunks", [])
        else:
            chunks = context.chunks

        embeddings = Services.embedder.generate_embeddings(chunks)
        
        if isinstance(context, dict):
            context["embeddings"] = embeddings
        else:
            context.embeddings = embeddings

        return context
