import os
import sys

# Add backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

print("\n=== Testing Document Pipeline ===\n")

# Import stages
from backend.services.pipeline.document_pipeline import DocumentPipeline

print("Creating pipeline...")
pipeline = DocumentPipeline()

print("Running pipeline...")
result = pipeline.run("uploads/Ankan_ml.pdf")

print(f"Result type: {type(result)}")
print(f"Result: {result}")
