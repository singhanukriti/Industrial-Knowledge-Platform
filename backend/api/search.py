from fastapi import APIRouter
from pydantic import BaseModel

try:
    from backend.services.search_service import SearchService
except ModuleNotFoundError:
    from services.search_service import SearchService

router = APIRouter(
    prefix="/search",
    tags=["Search"]
)

search_service = SearchService()


class SearchRequest(BaseModel):
    query: str
    filename: str | None = None
    top_k: int = 5


@router.post("/")
def search(request: SearchRequest):
    results = search_service.search(
        question=request.query,
        filename=request.filename
    )

    hits = []
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    for i, doc in enumerate(documents):
        meta = metadatas[i] if i < len(metadatas) else {}
        dist = distances[i] if i < len(distances) else 1.0
        hits.append({
            "content":  doc,
            "source":   meta.get("source", ""),
            "chunk":    meta.get("chunk", i),
            "score":    round(1 - dist, 4),   # convert distance to similarity
        })

    return {
        "query":   request.query,
        "results": hits,
    }
