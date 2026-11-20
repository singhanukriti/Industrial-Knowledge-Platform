from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.api.upload import router as upload_router
    from backend.api.chat import router as chat_router
    from backend.api.dashboard import router as dashboard_router
    from backend.api.search import router as search_router
    from backend.api.documents import router as documents_router
except ModuleNotFoundError:
    from api.upload import router as upload_router
    from api.chat import router as chat_router
    from api.dashboard import router as dashboard_router
    from api.search import router as search_router
    from api.documents import router as documents_router

app = FastAPI(
    title="Industrial Knowledge Platform",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Industrial Knowledge Platform API is Running"
    }


@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }


app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(dashboard_router)
app.include_router(search_router)
app.include_router(documents_router)
