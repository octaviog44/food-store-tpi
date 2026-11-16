from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class DetalleCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    forma_pago: str = Field(max_length=20)
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: Optional[str] = Field(default=None, max_length=500)
    items: list[DetalleCreate] = Field(min_length=1)


class DetalleRead(SQLModel):
    id: int
    producto_id: int
    cantidad: int
    nombre_producto: str
    precio_unitario: float
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str]
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetalleRead]


class CambioEstado(SQLModel):
    estado: str = Field(max_length=20)


class ResumenPedidos(SQLModel):
    total: int
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int