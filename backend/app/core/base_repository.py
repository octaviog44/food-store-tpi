from typing import Generic, Type, TypeVar

from sqlmodel import Session, SQLModel, select

ModelType = TypeVar("ModelType", bound=SQLModel)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: Session):
        self.model = model
        self.session = session

    def get_by_id(self, id: int) -> ModelType | None:
        return self.session.get(self.model, id)

    def get_all(self) -> list[ModelType]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, obj: ModelType) -> ModelType:
        self.session.add(obj)
        return obj

    def delete(self, obj: ModelType) -> None:
        self.session.delete(obj)