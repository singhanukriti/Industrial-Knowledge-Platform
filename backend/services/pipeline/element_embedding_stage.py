try:
    from core.services import Services
    from services.pipeline.base_stage import PipelineStage
except ModuleNotFoundError:
    from backend.core.services import Services
    from backend.services.pipeline.base_stage import PipelineStage


class ElementEmbeddingStage(PipelineStage):
    def process(self, context):
        print("Embedding document elements...")
        for element in context.elements:
            text = ""
            if element.element_type == "image":
                text = element.caption
            else:
                text = element.content

            element.embedding = Services.embedder.generate_embedding(
                text
            )
        print(f"Embedded {len(context.elements)} element(s).")
        return context
