class ServicesMeta(type):

    _pdf = None
    _splitter = None
    _embedder = None
    _chroma = None
    _search = None
    _captioner = None
    _queue = None

    @property
    def pdf(cls):
        if cls._pdf is None:
            try:
                from services.pdf_service import PDFService
            except ModuleNotFoundError:
                from backend.services.pdf_service import PDFService

            cls._pdf = PDFService()

        return cls._pdf

    @property
    def splitter(cls):
        if cls._splitter is None:
            try:
                from services.text_splitter import TextSplitterService
            except ModuleNotFoundError:
                from backend.services.text_splitter import TextSplitterService

            cls._splitter = TextSplitterService()

        return cls._splitter

    @property
    def embedder(cls):
        if cls._embedder is None:
            try:
                from services.embedding_service import EmbeddingService
            except ModuleNotFoundError:
                from backend.services.embedding_service import EmbeddingService

            cls._embedder = EmbeddingService()

        return cls._embedder

    @property
    def chroma(cls):
        if cls._chroma is None:
            try:
                from services.chroma_service import ChromaService
            except ModuleNotFoundError:
                from backend.services.chroma_service import ChromaService

            cls._chroma = ChromaService()

        return cls._chroma

    @property
    def captioner(cls):
        if cls._captioner is None:
            try:
                from services.vision.image_captioner import ImageCaptioner
            except ModuleNotFoundError:
                from backend.services.vision.image_captioner import ImageCaptioner

            cls._captioner = ImageCaptioner()

        return cls._captioner

    @property
    def queue(cls):
        if cls._queue is None:
            try:
                from services.queue.document_queue import DocumentQueue
            except ModuleNotFoundError:
                from backend.services.queue.document_queue import DocumentQueue

            cls._queue = DocumentQueue()

        return cls._queue

    @property
    def search(cls):
        if cls._search is None:
            try:
                from services.search_service import SearchService
            except ModuleNotFoundError:
                from backend.services.search_service import SearchService

            cls._search = SearchService()

        return cls._search


class Services(metaclass=ServicesMeta):
    pass
