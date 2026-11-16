from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__ = "producto"

    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", index=True)
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    precio_base: float = Field(ge=0)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)

    categoria: "Categoria" = Relationship(back_populates="productos")
    detalles: List["DetallePedido"] = Relationship(back_populates="producto")