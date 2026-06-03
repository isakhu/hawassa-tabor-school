from fastapi import APIRouter

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_stats():
    return {
        "students": 0,
        "teachers": 0,
        "classes": 0,
    }
