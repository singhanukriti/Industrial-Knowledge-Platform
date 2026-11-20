from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from datetime import datetime
import shutil
import os
import logging

try:
    from backend.utils.file_utils import validate_pdf
    from backend.utils.hash_utils import calculate_file_hash, HashUtils
    from backend.utils.duplicate_checker import is_duplicate
    from backend.utils.metadata import load_documents, save_documents
    from backend.services.metadata_service import MetadataService
    from backend.services.pipeline_service import PipelineService
    from backend.core.services import Services
except ModuleNotFoundError:
    from utils.file_utils import validate_pdf
    from utils.hash_utils import calculate_file_hash, HashUtils
    from utils.duplicate_checker import is_duplicate
    from utils.metadata import load_documents, save_documents
    from services.metadata_service import MetadataService
    from services.pipeline_service import PipelineService
    from core.services import Services

router = APIRouter()
logger = logging.getLogger(__name__)


UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload")
async def upload_pdf(files: list[UploadFile] = File(...)):
    processed = 0
    successful = 0
    failed = 0
    duplicates = 0
    documents = []

    # 1. Validate, deduplicate, and queue all files
    for file in files:
        try:
            validate_pdf(file)

            file_hash = calculate_file_hash(file)

            if is_duplicate(file_hash, UPLOAD_FOLDER):
                logger.info(f"Duplicate file skipped: {file.filename}")
                duplicates += 1
                processed += 1
                continue

            file_path = os.path.join(UPLOAD_FOLDER, file.filename)

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            Services.queue.add(file_path)
            documents.append(file.filename)
        except Exception:
            logger.exception(f"Failed to save/queue file {file.filename}")
            failed += 1
            processed += 1
        finally:
            await file.close()

    # 2. Process all queued files
    while not Services.queue.empty():
        pdf_path = Services.queue.get()
        if not pdf_path:
            continue

        filename = os.path.basename(pdf_path)
        processed += 1
        try:
            PipelineService.process_document(pdf_path)

            file_size = os.path.getsize(pdf_path)
            docs_metadata = load_documents()
            # Avoid duplicate entries in local metadata if it's already there
            if not any(d["filename"] == filename for d in docs_metadata):
                docs_metadata.append({
                    "filename": filename,
                    "size_kb": round(file_size / 1024, 2),
                    "uploaded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
                save_documents(docs_metadata)

            successful += 1
        except Exception:
            logger.exception(f"Failed to process {filename}")
            failed += 1

    if failed > 0 and successful == 0:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to process {failed} out of {processed} file(s)."
        )

    return {
        "processed": processed,
        "successful": successful,
        "failed": failed,
        "duplicates": duplicates,
        "documents": documents
    }


@router.get("/documents")
async def list_documents():
    metadata_service = MetadataService()
    metadata_docs = metadata_service.load_all()

    legacy_docs = load_documents()

    metadata_by_filename = {doc["filename"]: doc for doc in metadata_docs}

    merged = list(metadata_docs)
    for doc in legacy_docs:
        filename = doc["filename"]
        if filename not in metadata_by_filename:
            size_kb = doc.get("size_kb", 0)
            merged.append({
                "document_id": f"legacy_{filename}",
                "filename": filename,
                "hash": "",
                "pages": 0,
                "chunks": 0,
                "tables": 0,
                "images": 0,
                "figures": 0,
                "graphs": 0,
                "file_size": int(size_kb * 1024),
                "status": "uploaded",
                "uploaded_at": doc.get("uploaded_at", ""),
            })

    return merged


@router.delete("/documents/{filename}")
async def delete_document(filename: str):
    safe_name = os.path.basename(filename)
    file_path = os.path.join(UPLOAD_FOLDER, safe_name)

    # 1. Resolve document_id and file_hash from metadata
    metadata_service = MetadataService()
    docs = metadata_service.load_all()
    match = next((d for d in docs if d.get("filename") == safe_name), None)

    document_id = None
    file_hash = None
    if match:
        document_id = match.get("document_id")
        file_hash = match.get("hash")
    else:
        # If not found in metadata, compute the hash from the physical file if it exists
        if os.path.exists(file_path):
            try:
                from utils.hash_utils import HashUtils
            except ModuleNotFoundError:
                from backend.utils.hash_utils import HashUtils
            try:
                file_hash = HashUtils.sha256(file_path)
            except Exception:
                pass

    # 2. Delete all related entries from ChromaDB unconditionally.
    # This ensures that even if metadata is missing or out of sync, the database is cleaned up.
    Services.chroma.delete_document(document_id, safe_name, file_hash)

    # 3. Remove physical PDF file
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass

    # 4. Clean up metadata JSON files
    if document_id:
        metadata_service.delete(document_id)
    else:
        # Delete any metadata records matching the filename
        for doc in docs:
            if doc.get("filename") == safe_name:
                metadata_service.delete(doc.get("document_id"))
    # Additionally, clean up any metadata files that match the file hash (in case metadata entries missing)
    if file_hash:
        try:
            metadata_service.delete_by_hash(file_hash)
        except Exception:
            pass

    # 5. Keep the legacy flat list in sync for backward compatibility.
    flat = load_documents()
    flat = [doc for doc in flat if doc.get("filename") != safe_name]
    save_documents(flat)

    return {
        "message": f"{safe_name} deleted successfully."
    }
