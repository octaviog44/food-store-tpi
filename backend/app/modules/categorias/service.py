from app.modules.categorias.repository import CategoriaRepository
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def list(self) -> list[CategoriaRead]:
        with self.uow as uow:
            cats = uow.categorias.get_all()
            return [
                CategoriaRead.model_validate(c, from_attributes=True)
                for c in cats
                if c.activo
            ]

    def get(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            cat = uow.categorias.get_by_id(categoria_id)
            if not cat or not cat.activo:
                raise CategoriaNoEncontrada()
            return CategoriaRead.model_validate(cat, from_attributes=True)

    def create(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre):
                raise NombreDuplicado()
            from app.modules.categorias.models import Categoria

            cat = Categoria(**data.model_dump())
            uow.categorias.add(cat)
            uow.session.flush()
            uow.session.refresh(cat)
            return CategoriaRead.model_validate(cat, from_attributes=True)

    def update(
        self, categoria_id: int, data: CategoriaUpdate
    ) -> CategoriaRead:
        with self.uow as uow:
            cat = uow.categorias.get_by_id(categoria_id)
            if not cat or not cat.activo:
                raise CategoriaNoEncontrada()

            payload = data.model_dump(exclude_unset=True)
            if "nombre" in payload and payload["nombre"] != cat.nombre:
                if uow.categorias.get_by_nombre(payload["nombre"]):
                    raise NombreDuplicado()

            for field, value in payload.items():
                setattr(cat, field, value)
            uow.categorias.add(cat)
            uow.session.flush()
            uow.session.refresh(cat)
            return CategoriaRead.model_validate(cat, from_attributes=True)

    def delete(self, categoria_id: int) -> None:
        with self.uow as uow:
            cat = uow.categorias.get_by_id(categoria_id)
            if not cat or not cat.activo:
                raise CategoriaNoEncontrada()
            cat.activo = False
            uow.categorias.add(cat)