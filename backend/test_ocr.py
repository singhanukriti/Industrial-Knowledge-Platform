from services.ocr_service import OCRService

pdf_path = "uploads/Breathe_ESG_Tech_Intern_Assignment.pdf"

ocr = OCRService()
text = ocr.extract_text(pdf_path)

print(text)
