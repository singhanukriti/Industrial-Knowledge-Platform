import os
import sys

# Add backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# --------------------------------------------------------
# CHANGE THIS TO ANY PDF INSIDE uploads/
# --------------------------------------------------------
pdf_path = os.path.join("uploads", "graphexamples-how-to-do.pdf")

# --------------------------------------------------------
# Force-run the pipeline directly (bypasses duplicate check)
# so we can see the progress bar and final report
# --------------------------------------------------------
from services.pipeline.document_pipeline import DocumentPipeline

print(f"Processing: {pdf_path}")
print()

pipeline = DocumentPipeline()
pipeline.run(pdf_path)

# --------------------------------------------------------
# Verify: all chunks must be present (not just the last batch)
# --------------------------------------------------------
from core.services import Services
total = Services.chroma.count()
print(f"Total chunks in ChromaDB: {total}")
print("(Should be the SUM of all batches, not just the last one)")

print("\n")
print("=" * 60)
print("Pipeline Test Completed Successfully!")
print("=" * 60)