import re
from services.chunkers.base_chunker import BaseChunker

class MarkdownChunker(BaseChunker):
    def chunk(self, markdown):
        sections = re.split(r"(?=^#{1,6}\s)", markdown, flags=re.MULTILINE)
        chunks = []
        for section in sections:
            section = section.strip()
            if section:
                chunks.append(section)
        return chunks
