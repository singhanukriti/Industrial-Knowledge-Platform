from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

rag = None


class Question(BaseModel):
    filename: str
    question: str


def get_rag_service():
    global rag

    if rag is None:
        from services.rag_service import RAGService

        rag = RAGService()

    return rag


@router.post("/")
def chat(request: Question):

    rag_service = get_rag_service()

    answer = rag_service.answer(
        request.question,
        request.filename
    )

    return {
        "filename": request.filename,
        "question": request.question,
        "answer": answer
    }
