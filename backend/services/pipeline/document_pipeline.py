try:
    from models.document_context import DocumentContext
    from services.pipeline.text_stage import TextExtractionStage
    from services.pipeline.chunk_stage import ChunkStage
    from services.pipeline.embedding_stage import EmbeddingStage
    from services.pipeline.index_stage import IndexStage
    from services.pipeline.extraction_stage import ExtractionStage
    from services.pipeline.element_embedding_stage import ElementEmbeddingStage
    from services.pipeline.element_index_stage import ElementIndexStage
    from services.progress_service import ProgressService
    from services.report_service import ReportService
    from services.metadata_service import MetadataService
    from services.activity_service import ActivityService
except ModuleNotFoundError:
    from backend.models.document_context import DocumentContext
    from backend.services.pipeline.text_stage import TextExtractionStage
    from backend.services.pipeline.chunk_stage import ChunkStage
    from backend.services.pipeline.embedding_stage import EmbeddingStage
    from backend.services.pipeline.index_stage import IndexStage
    from backend.services.pipeline.extraction_stage import ExtractionStage
    from backend.services.pipeline.element_embedding_stage import ElementEmbeddingStage
    from backend.services.pipeline.element_index_stage import ElementIndexStage
    from backend.services.progress_service import ProgressService
    from backend.services.report_service import ReportService
    from backend.services.metadata_service import MetadataService
    from backend.services.activity_service import ActivityService


class DocumentPipeline:

    def __init__(self):
        self.stages = [
            TextExtractionStage(),
            ExtractionStage(),
            ChunkStage(),
            EmbeddingStage(),
            IndexStage(),
            ElementEmbeddingStage(),
            ElementIndexStage(),
        ]

        print("\nPipeline Stages:")
        for stage in self.stages:
            print(stage.__class__.__name__)
        print()

    def run(self, pdf_path):
        try:
            from services.pdf.page_iterator import PageIterator
        except ModuleNotFoundError:
            from backend.services.pdf.page_iterator import PageIterator

        try:
            from services.pdf_service import PDFService
        except ModuleNotFoundError:
            from backend.services.pdf_service import PDFService

        try:
            from core.services import Services
        except ModuleNotFoundError:
            from backend.core.services import Services

        try:
            from utils.hash_utils import HashUtils
        except ModuleNotFoundError:
            from backend.utils.hash_utils import HashUtils

        import os
        import time
        import fitz
        from datetime import datetime
        from uuid import uuid4

        source = os.path.basename(pdf_path)

        # Compute file hash and size once — used for metadata and dedup
        document_hash = HashUtils.sha256(pdf_path)
        file_size = os.path.getsize(pdf_path)

        # Generate a unique document_id shared across ALL batches of this document
        document_id = str(uuid4())

        # Delete any previous data for this source ONCE before batching.
        # Also remove the legacy "<source>_elements" variant so stale
        # duplicate table/figure chunks from older pipeline versions are
        # not left behind.
        for src in (source, f"{source}_elements"):
            try:
                Services.chroma.collection.delete(where={"source": src})
            except Exception:
                pass

        # Determine total pages and total batches up-front
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        doc.close()

        try:
            import settings
            PAGE_BATCH_SIZE = settings.PAGE_BATCH_SIZE
        except ImportError:
            PAGE_BATCH_SIZE = 25
        import math
        total_batches = math.ceil(total_pages / PAGE_BATCH_SIZE)

        start_time = time.time()

        # ── Pre-extraction: run Docling + element extraction ONCE ─────
        # TextExtractionStage and ExtractionStage operate on the full
        # document and are NOT per-batch. Run them here so that
        # context.document is populated and elements are detected.
        print("=" * 60)
        print("Running document-level extraction (Docling + elements)...")
        print("=" * 60)

        pre_context = DocumentContext(pdf_path=pdf_path)
        pre_context.document_id = document_id
        pre_context.total_pages = total_pages
        pre_context.start_time = start_time

        for stage in self.stages:
            if isinstance(stage, (TextExtractionStage, ExtractionStage)):
                pre_context = stage.process(pre_context)

        # Count element types from the full document extraction
        total_tables  = sum(1 for e in pre_context.elements if e.element_type == "table")
        total_images  = sum(1 for e in pre_context.elements if e.element_type == "image")
        total_figures = sum(1 for e in pre_context.elements if e.element_type == "figure")
        total_graphs  = sum(1 for e in pre_context.elements if e.element_type == "graph")

        print(f"Pre-extraction complete — tables:{total_tables}  images:{total_images}  figures:{total_figures}  graphs:{total_graphs}")
        print()

        # ── Batch loop: chunk → embed → index text ────────────────────
        chunk_offset  = 0
        element_offset = 0
        final_context = None
        failed_batches = []

        print(f"Document ID    : {document_id}")
        print(f"Total Pages    : {total_pages}")
        print(f"Total Batches  : {total_batches}")
        print()

        for batch_num, (document, start, end) in enumerate(PageIterator.iterate(pdf_path)):
            print(f"Processing pages {start + 1}–{end} of {total_pages} (batch {batch_num + 1}/{total_batches})")
            print()

            try:
                context = DocumentContext(pdf_path=pdf_path)

                # Shared state across all batches
                context.document_id   = document_id
                context.total_pages   = total_pages
                context.current_batch = batch_num
                context.total_batches = total_batches
                context.start_time    = start_time

                # Per-batch text (already extracted by PyMuPDF page iterator)
                context.text         = PDFService.extract_pages(document, start, end)
                context.is_markdown  = False
                context.chunk_offset = chunk_offset
                context.element_offset = element_offset
                context.batch_num    = batch_num

                context.processed_chunks = chunk_offset
                context.processed_tables = total_tables
                context.processed_images = total_images

                # Carry elements on batch 0 only so ElementEmbeddingStage
                # and ElementIndexStage run exactly once for the whole doc.
                if batch_num == 0:
                    context.elements = list(pre_context.elements)
                else:
                    context.elements = []

                # Run text-only stages (skip doc-level stages)
                for stage in self.stages:
                    if isinstance(stage, (TextExtractionStage, ExtractionStage)):
                        continue
                    context = stage.process(context)

                chunk_offset   += len(context.chunks)
                element_offset += len(pre_context.elements) if batch_num == 0 else 0

                context.processed_chunks = chunk_offset
                final_context = context

            except Exception as e:
                print()
                print(f"  [!!] Batch {batch_num + 1} FAILED")
                print(f"      {e}")
                failed_batches.append(batch_num + 1)
                continue

            ProgressService.update(context)

        # ── Final report ──────────────────────────────────────────────
        if final_context is None:
            final_context = DocumentContext(pdf_path=pdf_path)
            final_context.document_id  = document_id
            final_context.total_pages  = total_pages
            final_context.total_batches = total_batches
            final_context.start_time   = start_time

        ReportService.generate(final_context, failed_batches=failed_batches)

        # Save document metadata
        metadata_service = MetadataService()
        metadata_service.save({
            "document_id":  document_id,
            "filename":     source,
            "hash":         document_hash,
            "pages":        total_pages,
            "chunks":       chunk_offset,
            "tables":       total_tables,
            "images":       total_images,
            "figures":      total_figures,
            "graphs":       total_graphs,
            "file_size":    file_size,
            "status":       "indexed",
            "uploaded_at":  datetime.now().isoformat(),
        })

        # Log indexing activity
        activity_service = ActivityService()
        activity_service.add(
            "indexed",
            f"{source} indexed successfully. "
            f"{total_pages} pages, {chunk_offset} chunks, {total_tables} tables.",
        )

        return final_context
