try:
    from services.chunkers.chunker_factory import ChunkerFactory
    from services.pipeline.base_stage import PipelineStage
except ModuleNotFoundError:
    from backend.services.chunkers.chunker_factory import ChunkerFactory
    from backend.services.pipeline.base_stage import PipelineStage


class ChunkStage(PipelineStage):

    def process(self, context):
        print("Chunking document...")
        
        # Handle both dict and dataclass contexts for compatibility
        if isinstance(context, dict):
            is_markdown = context.get("is_markdown", False)
            text = context.get("text", "")
        else:
            is_markdown = context.is_markdown
            text = context.text
            
        chunker = ChunkerFactory.get_chunker(is_markdown)
        chunks = chunker.chunk(text)
        
        if isinstance(context, dict):
            context["chunks"] = chunks
        else:
            context.chunks = chunks
            
        print(f"Created {len(chunks)} chunks.")
        return context
