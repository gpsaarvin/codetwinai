import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

# Base class for SQLAlchemy ORM models
Base = declarative_base()

# Determine initial database engine setup
try:
    engine = create_async_engine(
        settings.ASYNC_DATABASE_URI,
        echo=False,
        future=True,
        pool_pre_ping=True
    )
except Exception as e:
    logger.warning(f"Could not connect to PostgreSQL ({e}). Falling back to async SQLite for dev.")
    engine = create_async_engine(
        settings.SQLITE_ASYNC_URI,
        echo=False,
        future=True,
        connect_args={"check_same_thread": False}
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    """Helper to initialize database tables automatically and seed a default demo user."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed demo user
    from sqlalchemy import select
    from app.models.user import User
    from app.models.profile import DeveloperProfile, SkillScore
    from app.core.security import get_password_hash

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == "demo@codetwin.ai"))
        existing = result.scalar_one_or_none()
        if not existing:
            demo_user = User(
                email="demo@codetwin.ai",
                hashed_password=get_password_hash("demo1234"),
                full_name="Demo Developer"
            )
            session.add(demo_user)
            await session.flush()

            profile = DeveloperProfile(user_id=demo_user.id)
            session.add(profile)
            await session.flush()

            categories_weights = [
                ("code_quality", 0.25),
                ("complexity", 0.20),
                ("error_handling", 0.20),
                ("testing", 0.20),
                ("consistency", 0.15),
            ]
            for cat, weight in categories_weights:
                session.add(SkillScore(profile_id=profile.id, category=cat, score=100.0, weight=weight))

            await session.commit()
            logger.info("Demo user 'demo@codetwin.ai' seeded successfully!")

