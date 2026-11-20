import fitz
import sys
import os

# Resolve the config directory path to bypass conflict with backend/config.py file
config_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "config"
)
if config_dir not in sys.path:
    sys.path.append(config_dir)

try:
    import settings
    PAGE_BATCH_SIZE = settings.PAGE_BATCH_SIZE
except ImportError:
    try:
        from config.settings import PAGE_BATCH_SIZE
    except ModuleNotFoundError:
        from backend.config.settings import PAGE_BATCH_SIZE


class PageIterator:

    @staticmethod
    def iterate(pdf_path):

        document = fitz.open(pdf_path)

        total_pages = len(document)

        for start in range(0, total_pages, PAGE_BATCH_SIZE):

            end = min(
                start + PAGE_BATCH_SIZE,
                total_pages
            )

            yield document, start, end

        document.close()
