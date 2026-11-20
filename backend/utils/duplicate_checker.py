import hashlib
from pathlib import Path


def file_hash(filepath):
    sha256 = hashlib.sha256()

    with open(filepath, "rb") as f:
        while True:
            chunk = f.read(4096)

            if not chunk:
                break

            sha256.update(chunk)

    return sha256.hexdigest()


def is_duplicate(upload_hash, upload_folder):
    upload_folder = Path(upload_folder)

    # Check if the hash exists in ChromaDB first
    try:
        from backend.core.services import Services
    except Exception:
        Services = None
    if Services is not None:
        try:
            if Services.chroma.document_exists(upload_hash):
                return True
        except Exception:
            pass

    # Fallback: scan the upload folder for existing files with the same hash
    for file in upload_folder.glob("*.pdf"):
        existing_hash = file_hash(file)
        if existing_hash == upload_hash:
            return True
    return False
