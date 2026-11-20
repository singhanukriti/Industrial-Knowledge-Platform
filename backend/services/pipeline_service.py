import os

try:
    from services.pipeline.document_pipeline import DocumentPipeline
except ModuleNotFoundError:
    from backend.services.pipeline.document_pipeline import DocumentPipeline

print(">>> USING PIPELINE:", DocumentPipeline)


class PipelineService:

    @classmethod
    def process_document(cls, pdf_path):

        try:
            from core.services import Services
        except ModuleNotFoundError:
            from backend.core.services import Services

        try:
            from utils.hash_utils import HashUtils
        except ModuleNotFoundError:
            from backend.utils.hash_utils import HashUtils

        file_hash = HashUtils.sha256(pdf_path)
        filename = os.path.basename(pdf_path)

        print("Processing:")
        print(filename)
        print()
        print("Hash:")
        print(file_hash)
        print()

        if Services.chroma.document_exists(file_hash):
            print("Skipping duplicate document.")
            return

        print("New document detected.")
        print()
        print("Indexing...")

        print("=" * 60)
        print("Starting Document Processing...")
        print("=" * 60)

        pipeline = DocumentPipeline()
        pipeline.run(pdf_path)

        print("=" * 60)
