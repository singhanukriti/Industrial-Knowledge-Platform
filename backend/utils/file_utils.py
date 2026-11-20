import os
from fastapi import HTTPException

# Maximum file size (20 MB)
MAX_FILE_SIZE = 20 * 1024 * 1024


def validate_pdf(file):
    """
    Validate uploaded PDF file.
    """

    # Check file extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    # Get file size
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)

    # Empty file
    if size == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    # File too large
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 20 MB."
        )

    # Check PDF magic bytes
    header = file.file.read(8)
    file.file.seek(0)

    if not header.startswith(b"%PDF"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file. File does not contain a valid PDF header."
        )
