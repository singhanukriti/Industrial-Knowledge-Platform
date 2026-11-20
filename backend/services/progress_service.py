import os
import time


class ProgressService:

    BAR_LENGTH = 40

    @staticmethod
    def update(context):
        """Print a formatted progress display after each batch."""

        if context.total_batches == 0:
            return

        progress = (context.current_batch + 1) / context.total_batches

        filled = int(ProgressService.BAR_LENGTH * progress)
        bar = "#" * filled + "-" * (ProgressService.BAR_LENGTH - filled)

        elapsed = int(time.time() - context.start_time)
        minutes = elapsed // 60
        seconds = elapsed % 60

        doc_name = os.path.basename(context.pdf_path)

        print()
        print("=" * 60)
        print("  Industrial Knowledge Platform")
        print("=" * 60)
        print(f"  Document : {doc_name}")
        print(f"  Progress : [{bar}] {progress * 100:.1f}%")
        print(f"  Batch    : {context.current_batch + 1} / {context.total_batches}")
        print(f"  Pages    : {context.total_pages}")
        print(f"  Chunks   : {context.processed_chunks}")
        print(f"  Tables   : {context.processed_tables}")
        print(f"  Images   : {context.processed_images}")
        print(f"  Elapsed  : {minutes:02d}:{seconds:02d}")
        print("=" * 60)
        print()
