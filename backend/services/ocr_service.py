import os
import re
from pathlib import Path

import fitz


BASE_DIR = Path(__file__).resolve().parents[1]
OCR_MODEL_DIR = BASE_DIR / "models" / "ocr"

os.environ["USERPROFILE"] = str(OCR_MODEL_DIR / "userprofile")
os.environ["PADDLE_HOME"] = str(OCR_MODEL_DIR / "paddle")
os.environ["PADDLE_PDX_CACHE_HOME"] = str(OCR_MODEL_DIR / "paddlex")
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"
os.environ["FLAGS_enable_pir_api"] = "0"


class OCRService:
    """
    Extract text from scanned PDFs using PaddleOCR.
    """

    _ocr = None

    @classmethod
    def get_ocr(cls):
        if cls._ocr is None:
            from paddleocr import PaddleOCR

            cls._ocr = PaddleOCR(
                text_detection_model_name="PP-OCRv5_mobile_det",
                text_recognition_model_name="PP-OCRv5_mobile_rec",
                use_doc_orientation_classify=False,
                use_doc_unwarping=False,
                use_textline_orientation=False
            )

        return cls._ocr

    def extract_text(self, pdf_path: str) -> str:
        document = fitz.open(pdf_path)
        temp_dir = OCR_MODEL_DIR / "temp_pages"
        temp_dir.mkdir(parents=True, exist_ok=True)

        all_text = []
        ocr = self.get_ocr()

        try:
            for page_number, page in enumerate(document, start=1):
                image_path = temp_dir / f"page_{page_number}.png"
                pixmap = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5))
                pixmap.save(image_path)

                results = ocr.predict(str(image_path))
                page_lines = []

                for result in results:
                    page_lines.extend(result.get("rec_texts", []))

                if page_lines:
                    all_text.append("\n".join(page_lines))
        finally:
            document.close()

            for image_file in temp_dir.glob("page_*.png"):
                try:
                    image_file.unlink()
                except OSError:
                    pass

        text = "\n\n".join(all_text)
        text = re.sub(r"\n\s*\n", "\n\n", text)
        text = re.sub(r"[ \t]+", " ", text)

        return text.strip()
