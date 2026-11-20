from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os

try:
    from backend.api.upload import UPLOAD_FOLDER
except ModuleNotFoundError:
    from api.upload import UPLOAD_FOLDER

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.get("/{filename}/file")
def get_document_file(filename: str):
    safe_name = os.path.basename(filename)
    file_path = os.path.join(UPLOAD_FOLDER, safe_name)

    if not os.path.isfile(file_path):
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=safe_name,
        content_disposition_type="inline"
    )
