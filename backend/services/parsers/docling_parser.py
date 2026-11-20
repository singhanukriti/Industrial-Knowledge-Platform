try:
    from docling.document_converter import DocumentConverter
    _DOCLING_AVAILABLE = True
except ImportError:
    _DOCLING_AVAILABLE = False

class DoclingParser:
    def __init__(self):
        if not _DOCLING_AVAILABLE:
            print("Docling not installed — will fall back to PyMuPDF.")
            self.converter = None
            return
        print("Loading Docling Parser...")
        self.converter = DocumentConverter()
        print("Docling Ready.")

    def parse(self, pdf_path: str):
        if not _DOCLING_AVAILABLE or self.converter is None:
            raise RuntimeError("Docling is not installed. Falling back to PyMuPDF.")
        result = self.converter.convert(pdf_path)
        document = result.document
        markdown = document.export_to_markdown()
        return {
            "text": markdown,
            "document": document,
            "is_markdown": True
        }
