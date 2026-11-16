from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    FormaPagoInvalida,
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])
admin_only = require_role(["admin"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


# ─── Crear pedido (cualquier usuario logueado) ───────────────────────────
@router.post(
    "", response_model=PedidoRead, status_code=status.HTTP_201_CREATED
)
def crear(
    data: PedidoCreate,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.create(data, current_user)
    except FormaPagoInvalida:
        raise HTTPException(
            status_code=400,
            detail="Forma de pago inválida (EFECTIVO o TRANSFERENCIA)",
        )
    except ProductoRepetido:
        raise HTTPException(
            status_code=400,
            detail="No se puede repetir un producto en el pedido",
        )
    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=404, detail="Producto no encontrado"
        )
    except ProductoNoDisponible:
        raise HTTPException(
            status_code=400, detail="Producto no disponible"
        )
    except StockInsuficiente:
        raise HTTPException(
            status_code=400, detail="Stock insuficiente"
        )


# ─── Mis pedidos (cliente) ───────────────────────────────────────────────
@router.get("/mis-pedidos", response_model=list[PedidoRead])
def mis_pedidos(
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.list_mine(current_user)


# ─── Todos los pedidos (admin) ───────────────────────────────────────────
@router.get("", response_model=list[PedidoRead])
def listar_todos(
    _: Usuario = Depends(admin_only),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.list_all()


# ─── Resumen para el panel (admin) ───────────────────────────────────────
@router.get("/resumen", response_model=ResumenPedidos)
def resumen(
    _: Usuario = Depends(admin_only),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.resumen()


# ─── Detalle (dueño o admin) ─────────────────────────────────────────────
@router.get("/{pedido_id}", response_model=PedidoRead)
def detalle(
    pedido_id: int,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.get(pedido_id, current_user)
    except PedidoNoEncontrado:
        raise HTTPException(
            status_code=404, detail="Pedido no encontrado"
        )
    except PedidoAjeno:
        raise HTTPException(
            status_code=403, detail="No tienes acceso a este pedido"
        )


# ─── Cambiar estado (dueño cancelando desde PENDIENTE o admin) ───────────
@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int,
    data: CambioEstado,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.change_estado(pedido_id, data, current_user)
    except PedidoNoEncontrado:
        raise HTTPException(
            status_code=404, detail="Pedido no encontrado"
        )
    except PedidoAjeno:
        raise HTTPException(
            status_code=403, detail="No puedes modificar este pedido"
        )
    except TransicionInvalida:
        raise HTTPException(
            status_code=400, detail="Transición de estado inválida"
        )