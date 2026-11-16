from datetime import datetime, timezone

from sqlmodel import select

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    DetalleRead,
    PedidoCreate,
    PedidoRead,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario


# ─── Excepciones de dominio ───────────────────────────────────────────────
class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class FormaPagoInvalida(Exception):
    pass


# ─── Máquina de estados (RN-02) ───────────────────────────────────────────
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}

FORMAS_PAGO_VALIDAS = {"EFECTIVO", "TRANSFERENCIA"}


def _to_read(pedido: Pedido) -> PedidoRead:
    return PedidoRead(
        id=pedido.id,
        usuario_id=pedido.usuario_id,
        estado=pedido.estado,
        forma_pago=pedido.forma_pago,
        direccion_entrega=pedido.direccion_entrega,
        notas=pedido.notas,
        total=pedido.total,
        created_at=pedido.created_at,
        updated_at=pedido.updated_at,
        items=[
            DetalleRead(
                id=d.id,
                producto_id=d.producto_id,
                cantidad=d.cantidad,
                nombre_producto=d.nombre_producto,
                precio_unitario=d.precio_unitario,
                subtotal=d.subtotal,
            )
            for d in pedido.items
        ],
    )


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    # ─── RN-01 Crear pedido (transaccional) ──────────────────────────────
    def create(
        self, data: PedidoCreate, current_user: Usuario
    ) -> PedidoRead:
        if data.forma_pago not in FORMAS_PAGO_VALIDAS:
            raise FormaPagoInvalida()

        # Sin productos repetidos
        ids = [item.producto_id for item in data.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido()

        with self.uow as uow:
            pedido = Pedido(
                usuario_id=current_user.id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
            )
            uow.pedidos.add(pedido)
            uow.session.flush()

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if not producto or not producto.activo:
                    raise ProductoNoEncontrado()
                if not producto.disponible:
                    raise ProductoNoDisponible()
                if producto.stock < item.cantidad:
                    raise StockInsuficiente()

                # Descontar stock en la misma iteración (RN-01)
                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = producto.precio_base * item.cantidad
                total += subtotal

                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.session.add(detalle)

            pedido.total = total
            uow.pedidos.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return _to_read(pedido)

    # ─── Listados con permisos (RN-04) ───────────────────────────────────
    def list_mine(self, current_user: Usuario) -> list[PedidoRead]:
        with self.uow as uow:
            pedidos = uow.pedidos.list_by_usuario(current_user.id)
            return [_to_read(p) for p in pedidos]

    def list_all(self) -> list[PedidoRead]:
        with self.uow as uow:
            pedidos = uow.pedidos.get_all()
            return [_to_read(p) for p in pedidos]

    # ─── Detalle con permisos (RN-04) ────────────────────────────────────
    def get(
        self, pedido_id: int, current_user: Usuario
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado()
            if (
                current_user.role != "admin"
                and pedido.usuario_id != current_user.id
            ):
                raise PedidoAjeno()
            return _to_read(pedido)

    # ─── RN-02 + RN-03 Cambio de estado ──────────────────────────────────
    def change_estado(
        self,
        pedido_id: int,
        data: CambioEstado,
        current_user: Usuario,
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado()

            # Permisos (RN-04)
            if current_user.role != "admin":
                if pedido.usuario_id != current_user.id:
                    raise PedidoAjeno()
                # Cliente solo puede cancelar desde PENDIENTE
                if data.estado != "CANCELADO" or pedido.estado != "PENDIENTE":
                    raise PedidoAjeno()

            # Validar transición (RN-02)
            if data.estado not in TRANSICIONES.get(pedido.estado, set()):
                raise TransicionInvalida()

            # Restituir stock si cancela (RN-03)
            if data.estado == "CANCELADO":
                for detalle in pedido.items:
                    producto = uow.productos.get_by_id(detalle.producto_id)
                    if producto:
                        producto.stock += detalle.cantidad
                        uow.productos.add(producto)

            pedido.estado = data.estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return _to_read(pedido)

    # ─── Resumen para el panel admin ─────────────────────────────────────
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            pendientes = uow.pedidos.count_by_estado("PENDIENTE")
            en_prep = uow.pedidos.count_by_estado("EN_PREPARACION")
            entregados = uow.pedidos.count_by_estado("ENTREGADO")
            cancelados = uow.pedidos.count_by_estado("CANCELADO")
            total = pendientes + en_prep + entregados + cancelados
            return ResumenPedidos(
                total=total,
                pendientes=pendientes,
                en_preparacion=en_prep,
                entregados=entregados,
                cancelados=cancelados,
            )