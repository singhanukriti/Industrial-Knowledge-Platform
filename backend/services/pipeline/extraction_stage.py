try:
    from services.pipeline.base_stage import PipelineStage
    from services.extractors.table_extractor import TableExtractor
    from services.extractors.figure_extractor import FigureExtractor
    from services.extractors.image_extractor import ImageExtractor
except ModuleNotFoundError:
    from backend.services.pipeline.base_stage import PipelineStage
    from backend.services.extractors.table_extractor import TableExtractor
    from backend.services.extractors.figure_extractor import FigureExtractor
    from backend.services.extractors.image_extractor import ImageExtractor


class ExtractionStage(PipelineStage):
    def __init__(self):
        self.extractors = [TableExtractor(), FigureExtractor(), ImageExtractor()]

    def process(self, context):
        print("Running document extractors...")
        if not hasattr(context, "document") or context.document is None:
            print("No Docling document available.")
            return context

        for extractor in self.extractors:
            context = extractor.extract(context.document, context)

        print(f"Total Elements: {len(context.elements)}")
        return context
