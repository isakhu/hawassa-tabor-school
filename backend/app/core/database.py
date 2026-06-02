"""
Database setup.
Creates the async SQLAlchemy engine, session factory, and declarative Base.
All ORM models will inherit from Base defined here.
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",  # logs SQL in dev only
    pool_pre_ping=True,                           # drops stale connections
    pool_size=10,
    max_overflow=20,
)

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# ---------------------------------------------------------------------------
# Declarative base  (all models inherit from this)
# ---------------------------------------------------------------------------


class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Dependency  (used in FastAPI route handlers via Depends)
# ---------------------------------------------------------------------------

async def get_db() -> AsyncSession:
    """
    Yield a database session and ensure it is closed after the request.
    Usage:
        @router.get("/example")
        async def example(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ---------------------------------------------------------------------------
# Utility  (dev / migration helper — do NOT use in production routes)
# ---------------------------------------------------------------------------

async def create_all_tables() -> None:
    """
    Create all tables registered on Base.metadata.

    IMPORTANT: All ORM models must be imported BEFORE this function is called
    so SQLAlchemy knows about them.  In main.py we do:
        import app.models          # registers all models
        await create_all_tables()  # then create their tables

    Safe to call on every startup — SQLAlchemy uses CREATE TABLE IF NOT EXISTS
    semantics so existing tables and data are never touched.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
