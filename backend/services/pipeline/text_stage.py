try:
    from services.pdf_service import PDFService
    from services.parsers.docling_parser import DoclingParser
    from services.pipeline.base_stage import PipelineStage
except ModuleNotFoundError:
    from backend.services.pdf_service import PDFService
    from backend.services.parsers.docling_parser import DoclingParser
    from backend.services.pipeline.base_stage import PipelineStage


class TextExtractionStage(PipelineStage):

    def __init__(self):
        self.pdf_service = PDFService()
        self.docling = DoclingParser()

    def process(self, context):
        # Handle both dict and dataclass contexts for compatibility
        if isinstance(context, dict):
            pdf_path = context["pdf_path"]
        else:
            pdf_path = context.pdf_path
            
        print("Extracting document...")

        try:
            result = self.docling.parse(pdf_path)
            if isinstance(context, dict):
                context["text"] = result["text"]
                context["document"] = result["document"]
                context["is_markdown"] = True
            else:
                context.text = result["text"]
                context.document = result["document"]
                context.is_markdown = True
            print("Using Docling Parser")
        except Exception as e:
            print(f"Docling failed: {e}")
            print("Using PyMuPDF.")
            if isinstance(context, dict):
                context["text"] = self.pdf_service.extract_text(pdf_path)
                context["is_markdown"] = False
            else:
                context.text = self.pdf_service.extract_text(pdf_path)
                context.is_markdown = False

        return context
