import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.metadata_service import MetadataService

metadata = MetadataService()

# Save a test document
metadata.save({
    "document_id": "test_abc123",
    "filename": "Python.pdf",
    "pages": 184,
    "chunks": 420,
    "tables": 10,
    "images": 24,
    "figures": 3,
    "graphs": 2,
    "status": "indexed",
})

loaded = metadata.load("test_abc123")
print("Loaded:", loaded)

all_docs = metadata.load_all()
print("Count:", metadata.count())

# Cleanup test artifact
metadata.delete("test_abc123")
print("Cleanup done. Count after delete:", metadata.count())
