from typing import Optional

from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(Producto, session)

    def search(
        self,
        nombre: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        solo_activos: bool = True,
    ) -> list[Producto]:
        stmt = select(Producto)
        if solo_activos:
            stmt = stmt.where(Producto.activo == True)  # noqa: E712
        if nombre:
            stmt = stmt.where(Producto.nombre.ilike(f"%{nombre}%"))
        if categoria_id is not None:
            stmt = stmt.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            stmt = stmt.where(Producto.disponible == disponible)
        return list(self.session.exec(stmt).all())