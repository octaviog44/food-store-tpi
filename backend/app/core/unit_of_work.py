from sqlmodel import Session

from app.core.database import engine


class UnitOfWork:
    def __init__(self) -> None:
        self.session: Session | None = None

    def __enter__(self) -> "UnitOfWork":
        self.session = Session(engine)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if self.session is None:
            return
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
            self.session = None