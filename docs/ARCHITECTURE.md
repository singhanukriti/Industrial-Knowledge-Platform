# Industrial Knowledge Platform — Backend Architecture

## 1. System Overview

The Industrial Knowledge Platform is a RAG-powered document intelligence system built with FastAPI (backend) and React (frontend). Users upload PDF documents, which are processed through a multi-stage pipeline, chunked, embedded, and indexed into ChromaDB for semantic search and chat-based Q&A.

```
Frontend (React + Vite)
    │
    ▼
FastAPI Backend
    │
    ├── Upload API ──► Document Pipeline ──► ChromaDB
    │
    ├── Chat API ─────┘
    │
    ├── Search API ────┘
    │
    └── Dashboard API (stats, recent docs, storage)
```

---

## 2. Document Upload Flow

### 2.1 Entry Point

**File:** `backend/api/upload.py`

The `/upload` endpoint accepts `multipart/form-data` with one or more PDF files.

```
POST /upload
Body: FormData { files: <PDF> }
```

### 2.2 Save & Queue

For each uploaded file:

1. **Validate** (`utils/file_utils.py`) — checks extension `.pdf`, non-empty, ≤20 MB.
2. **Save to disk** — writes to `backend/uploads/<filename>`.
3. **Hash** (`utils/hash_utils.py`) — computes SHA-256 of the saved file.
4. **Duplicate check** (`utils/duplicate_checker.py`) — checks ChromaDB first (`chroma.document_exists(hash)`), then scans the upload folder for files with the same hash.
5. **Queue** (`services/queue/document_queue.py`) — unique files are added to an in-memory `Queue` for async processing.

### 2.3 Processing Loop

After all files are saved/queued, the endpoint drains the queue synchronously:

```python
while not Services.queue.empty():
    pdf_path = Services.queue.get()
    PipelineService.process_document(pdf_path)
```

### 2.4 Pipeline Stages

**File:** `services/pipeline/document_pipeline.py`

The `DocumentPipeline` runs these stages in order:

| # | Stage | Class | Purpose |
|---|-------|-------|---------|
| 1 | Text Extraction | `TextExtractionStage` | Parses PDF using Docling (preferred) or PyMuPDF fallback. Produces full document text. |
| 2 | Element Extraction | `ExtractionStage` | Detects tables, figures, and images from the Docling document model. |
| 3 | Chunking | `ChunkStage` | Splits text into semantically meaningful chunks using `TextSplitterService`. |
| 4 | Embedding | `EmbeddingStage` | Generates vector embeddings for each text chunk via `EmbeddingService`. |
| 5 | Indexing | `IndexStage` | Upserts chunks + embeddings into ChromaDB collection `industrial_documents`. |
| 6 | Element Embedding | `ElementEmbeddingStage` | Embeds table/image/figure content. |
| 7 | Element Indexing | `ElementIndexStage` | Indexes element embeddings into ChromaDB. |

#### Batch Processing

Large PDFs are processed in batches (default `PAGE_BATCH_SIZE = 25` pages per batch). The pipeline uses `PageIterator` to yield `(fitz_document, start_page, end_page)` tuples. Documents are assigned a single `document_id` (UUID) at the start, which is shared across all batches.

**Key design decisions:**
- Docling document and element extraction run **once** on the full document before batching.
- Batch 0 carries forward the element list; subsequent batches skip element stages.
- Before processing, any existing ChromaDB entries for the same `source` (and `{source}_elements` legacy variant) are deleted to prevent stale data on re-uploads.

### 2.5 Metadata Storage

After successful indexing, two metadata stores are updated:

1. **Legacy flat list** (`backend/data/documents.json`) — simple array of `{filename, size_kb, uploaded_at}`.
2. **Per-document metadata** (`backend/metadata/<document_id>.json`) — detailed record:

```json
{
    "document_id": "<uuid>",
    "filename": "example.pdf",
    "hash": "<sha256>",
    "pages": 34,
    "chunks": 102,
    "tables": 11,
    "images": 0,
    "figures": 0,
    "graphs": 0,
    "file_size": 770052,
    "status": "indexed",
    "uploaded_at": "2026-07-13T22:38:26.937710"
}
```

---

## 3. ChromaDB Storage Model

**File:** `backend/services/chroma_service.py`

**Collection:** `industrial_documents`

Each chunk is stored with:

| Field | Value |
|-------|-------|
| `id` | `{document_id}_{batch}_{chunk_index}` |
| `document` | Chunk text content |
| `embedding` | Vector embedding |
| `metadata.document_id` | UUID shared across all chunks of the same PDF |
| `metadata.source` | Original filename |
| `metadata.batch` | Batch number (0-based) |
| `metadata.chunk` | Global chunk offset |
| `metadata.file_hash` | SHA-256 of the PDF |
| `metadata.element_type` | `"text"`, `"table"`, `"image"`, or `"figure"` |

**Deduplication:** `document_exists(hash)` queries by `file_hash` metadata.

**Deletion:** `delete_document(document_id, source, file_hash)` collects IDs by all three fields, then deletes them in one call.

---

## 4. Frontend Integration

### 4.1 Upload Page

**File:** `frontend/src/pages/Upload/UploadPage.tsx`

- Supports drag-and-drop and file picker (multiple files).
- Maintains a local `queue` with status per file: `pending` → `uploading` → `done` / `error`.
- On success, invalidates React Query caches for `dashboard`, `recent-documents`, `activity`, `storage`, and `documents`.
- On failure, surfaces the backend error message.

### 4.2 Documents Page

**File:** `frontend/src/pages/Documents/DocumentsPage.tsx`

- Fetches via `GET /documents` (returns all metadata JSON files).
- Displays filename, page/chunk/table/image counts, status badge, and upload date.
- Supports search, preview (PdfViewerModal), chat navigation, and delete.

### 4.3 Chat Integration

- Chat references documents by `filename`.
- Backend search filters ChromaDB by `source = filename` (or `filename_elements`).

---

## 5. API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload` | — | Upload one or more PDFs |
| GET | `/documents` | — | List all indexed documents |
| DELETE | `/documents/{filename}` | — | Delete a document and its embeddings |
| GET | `/documents/{filename}/file` | — | Stream PDF file |
| POST | `/chat` | — | Send a question with optional `filename` filter |
| GET | `/dashboard/stats` | — | Aggregate stats |
| GET | `/dashboard/recent` | — | Recently indexed documents |
| GET | `/dashboard/storage` | — | Storage usage |
| GET | `/search?q=` | — | Full-text + semantic search |

---

## 6. Known Issues & Fixes Applied

### Issue 1: Uploaded PDF not appearing in Documents page
**Root cause:** The upload endpoint returned HTTP 200 even when `PipelineService.process_document()` threw an exception. The frontend marked the file as "Indexed" based on HTTP status alone.

**Fix:**
- Backend: `backend/api/upload.py` now raises `HTTPException(400)` when ALL files in a batch fail processing.
- Frontend: `UploadPage.tsx` now extracts `error.response.data.detail` for display and invalidates the `documents` query on success.

### Issue 2: All uploads returning 400 Bad Request
**Root cause:** Duplicate detection incorrectly counted the just-saved file as a duplicate (the file existed in the upload folder before the hash check ran), incrementing the `failed` counter and triggering the 400 response.

**Fix:**
- `backend/api/upload.py` tracks duplicates in a separate `duplicates` counter.
- The endpoint only returns 400 when `failed > 0 and successful == 0` (total failure). Partially successful batch uploads return 200.

---

## 7. Configuration

**File:** `config/settings.py` (resolved via `backend/services/pdf/page_iterator.py`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PAGE_BATCH_SIZE` | 25 | Number of PDF pages processed per batch |

**Environment variables** (loaded via `python-dotenv`):
- `GROQ_API_KEY` — LLM provider for embeddings/chat.

---

## 8. Technology Stack

### Backend
- **Framework:** FastAPI 0.138
- **PDF Parsing:** PyMuPDF (1.28), Docling
- **OCR:** PaddleOCR (via `services/ocr_service.py`)
- **Embeddings:** SentenceTransformers / LangChain
- **Vector DB:** ChromaDB 1.5 (persistent, `./chroma_db`)
- **LLM:** Groq via LangChain
- **Storage:** Local filesystem (`backend/uploads/`, `backend/metadata/`, `backend/data/`)

### Frontend
- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **State:** React Query (TanStack)
- **Routing:** React Router v6
- **UI:** Tailwind CSS + shadcn/ui components
- **HTTP Client:** Axios

---

## 9. Running the Application

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8000`.

---

## 10. Data Flow Diagram

```
User selects PDF(s)
        │
        ▼
POST /upload (FormData)
        │
        ▼
Save → Hash → Dedup check
        │
        ▼
Queue (in-memory)
        │
        ▼
DocumentPipeline.run()
        │
        ├── TextExtraction (Docling / PyMuPDF)
        ├── Extraction (tables, figures, images)
        ├── ChunkStage (text splitting)
        ├── EmbeddingStage (vectors)
        ├── IndexStage (ChromaDB upsert)
        ├── ElementEmbeddingStage
        └── ElementIndexStage
        │
        ▼
Metadata save (legacy JSON + per-doc JSON)
        │
        ▼
HTTP 200 / 400
        │
        ▼
Frontend updates UI
```
