from services.chunkers.markdown_chunker import MarkdownChunker
from services.chunkers.recursive_chunker import RecursiveChunker

class ChunkerFactory:
    @staticmethod
    def get_chunker(use_markdown=False):
        if use_markdown:
            return MarkdownChunker()
        return RecursiveChunker()
