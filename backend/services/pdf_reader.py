try:
    from backend.services.pdf_service import PDFService
except ModuleNotFoundError:
    from services.pdf_service import PDFService


class PDFReader:

    def extract_text(self, pdf_path: str) -> str:
        return PDFService.extract_text(pdf_path)
