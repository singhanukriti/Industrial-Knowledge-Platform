from langchain_text_splitters import RecursiveCharacterTextSplitter
from services.chunkers.base_chunker import BaseChunker

class RecursiveChunker(BaseChunker):
    def __init__(self):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                ""
            ]
        )

    def chunk(self, text):
        return self.splitter.split_text(text)
