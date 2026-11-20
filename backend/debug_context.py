import os
import sys

# Add backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test DocumentContext creation
from backend.models.document_context import DocumentContext

ctx = DocumentContext(pdf_path="test.pdf")
print(f"Created context type: {type(ctx)}")
print(f"Is dict: {isinstance(ctx, dict)}")
print(f"pdf_path: {ctx.pdf_path}")
print(f"Context: {ctx}")
