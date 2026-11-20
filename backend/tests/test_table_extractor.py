import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
project_root = os.path.dirname(backend_dir)
for path in (backend_dir, project_root):
    if path not in sys.path:
        sys.path.append(path)

try:
    from services.parsers.docling_parser import DoclingParser
    from services.extractors.table_extractor import TableExtractor
    from models.document_context import DocumentContext
except ModuleNotFoundError:
    from backend.services.parsers.docling_parser import DoclingParser
    from backend.services.extractors.table_extractor import TableExtractor
    from backend.models.document_context import DocumentContext


parser = DoclingParser()
result = parser.parse(r"uploads/15 Companies Mega Hiring For Freshers.pdf")
document = result["document"]
context = DocumentContext(pdf_path=r"uploads/15 Companies Mega Hiring For Freshers.pdf")
extractor = TableExtractor()
context = extractor.extract(document, context)

print("=" * 80)
print("Total Elements:", len(context.elements))
print("=" * 80)
for element in context.elements:
    print(element.element_type)
    print(element.content)
    print("-" * 80)
