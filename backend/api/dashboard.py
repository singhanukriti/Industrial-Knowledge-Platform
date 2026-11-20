from fastapi import APIRouter

try:
    from backend.services.dashboard_service import DashboardService
except ModuleNotFoundError:
    from services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def dashboard_stats():
    return DashboardService.get_dashboard_stats()


@router.get("/recent")
def recent_documents():
    return DashboardService.get_recent_documents()


@router.get("/activity")
def recent_activity():
    return DashboardService.get_recent_activity()


@router.get("/storage")
def storage():
    return DashboardService.storage_usage()
