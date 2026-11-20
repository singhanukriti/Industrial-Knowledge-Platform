import re
try:
    import fitz
except ImportError:
    fitz = None  # type: ignore

try:
    from services.ocr_service import OCRService
except ModuleNotFoundError:
    from backend.services.ocr_service import OCRService


class PDFService:
    
    ocr = OCRService()


    @staticmethod
    def extract_text(pdf_path: str) -> str:
        """
        Extract text from a PDF.

        Strategy:
        1. Try PyMuPDF first (fast).
        2. If almost no text is extracted,
           automatically use OCR.
        """

        print("=" * 60)
        print("Reading PDF using PyMuPDF...")
        print("=" * 60)

        document = fitz.open(pdf_path)

        text = ""

        for page in document:
            text += page.get_text() + "\n"

        document.close()

        text = re.sub(r"\n\s*\n", "\n\n", text)
        text = re.sub(r"[ \t]+", " ", text)

        text = text.strip()

        # ---------- OCR Fallback ----------

        if len(text) < 100:

            print("\nVery little text detected.")
            print("Switching to PaddleOCR...\n")

            text = PDFService.ocr.extract_text(pdf_path)

        else:

            print("Digital PDF detected.")
            print("OCR not required.\n")

        return text

    @staticmethod
    def extract_pages(document, start, end):

        text = ""

        for page_num in range(start, end):

            text += document[page_num].get_text() + "\n"

        text = re.sub(r"\n\s*\n", "\n\n", text)
        text = re.sub(r"[ \t]+", " ", text)
        return text.strip()

