import os
import time


class ReportService:

    @staticmethod
    def generate(context, failed_batches=None):
        """Print a final processing report after the pipeline completes."""

        if failed_batches is None:
            failed_batches = []

        elapsed = int(time.time() - context.start_time)
        doc_name = os.path.basename(context.pdf_path)
        status = "SUCCESS" if not failed_batches else "PARTIAL"

        print()
        print("=" * 70)
        print("  DOCUMENT PROCESSING REPORT")
        print("=" * 70)
        print(f"  Document       : {doc_name}")
        print(f"  Document ID    : {context.document_id}")
        print(f"  Pages          : {context.total_pages}")
        print(f"  Batches        : {context.total_batches}")
        print(f"  Chunks Created : {context.processed_chunks}")
        print(f"  Tables         : {context.processed_tables}")
        print(f"  Images         : {context.processed_images}")
        print(f"  Time           : {elapsed} sec")
        print(f"  Failed Batches : {len(failed_batches)}")
        if failed_batches:
            print(f"  Batch IDs      : {failed_batches}")
        print(f"  Status         : {status}")
        print("=" * 70)
        print()
