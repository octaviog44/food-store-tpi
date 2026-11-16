
from sqlmodel import SQLModel, Session, create_engine

from app.core.config import settings


engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True
)


def session_factory() -> Session:
    return Session(engine)


def create_all_tables() -> None:
    SQLModel.metadata.create_all(engine)
