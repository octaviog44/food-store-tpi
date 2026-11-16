from typing import Optional

from sqlmodel import Field, SQLModel


class ProductoBase(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    precio_base: float = Field(ge=0)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    categoria_id: int


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(SQLModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    disponible: Optional[bool] = None
    categoria_id: Optional[int] = None


class ProductoRead(ProductoBase):
    id: int
    activo: bool


class StockUpdate(SQLModel):
    stock: int = Field(ge=0)


class DisponibilidadUpdate(SQLModel):
    disponible: bool


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]