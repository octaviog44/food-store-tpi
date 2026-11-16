from typing import Optional

from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository
from app.modules.productos.schemas import (
    DisponibilidadUpdate,
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoUpdate,
    StockUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class CategoriaNoEncontrada(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def list(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            all_items = uow.productos.search(
                nombre=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            total = len(all_items)
            items = all_items[skip : skip + limit]
            return ProductosPaginados(
                total=total,
                items=[
                    ProductoRead.model_validate(p, from_attributes=True)
                    for p in items
                ],
            )

    def get(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            p = uow.productos.get_by_id(producto_id)
            if not p or not p.activo:
                raise ProductoNoEncontrado()
            return ProductoRead.model_validate(p, from_attributes=True)

    def create(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            cat = CategoriaRepository(uow.session).get_by_id(
                data.categoria_id
            )
            if not cat or not cat.activo:
                raise CategoriaNoEncontrada()
            p = Producto(**data.model_dump())
            uow.productos.add(p)
            uow.session.flush()
            uow.session.refresh(p)
            return ProductoRead.model_validate(p, from_attributes=True)

    def update(
        self, producto_id: int, data: ProductoUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            p = uow.productos.get_by_id(producto_id)
            if not p or not p.activo:
                raise ProductoNoEncontrado()
            payload = data.model_dump(exclude_unset=True)
            if "categoria_id" in payload:
                cat = CategoriaRepository(uow.session).get_by_id(
                    payload["categoria_id"]
                )
                if not cat or not cat.activo:
                    raise CategoriaNoEncontrada()
            for field, value in payload.items():
                setattr(p, field, value)
            uow.productos.add(p)
            uow.session.flush()
            uow.session.refresh(p)
            return ProductoRead.model_validate(p, from_attributes=True)

    def update_stock(
        self, producto_id: int, data: StockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            p = uow.productos.get_by_id(producto_id)
            if not p or not p.activo:
                raise ProductoNoEncontrado()
            p.stock = data.stock
            uow.productos.add(p)
            uow.session.flush()
            uow.session.refresh(p)
            return ProductoRead.model_validate(p, from_attributes=True)

    def update_disponibilidad(
        self, producto_id: int, data: DisponibilidadUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            p = uow.productos.get_by_id(producto_id)
            if not p or not p.activo:
                raise ProductoNoEncontrado()
            p.disponible = data.disponible
            uow.productos.add(p)
            uow.session.flush()
            uow.session.refresh(p)
            return ProductoRead.model_validate(p, from_attributes=True)

    def delete(self, producto_id: int) -> None:
        with self.uow as uow:
            p = uow.productos.get_by_id(producto_id)
            if not p or not p.activo:
                raise ProductoNoEncontrado()
            p.activo = False
            uow.productos.add(p)