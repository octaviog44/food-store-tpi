from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(Pedido, session)

    def list_by_usuario(self, usuario_id: int) -> list[Pedido]:
        return list(
            self.session.exec(
                select(Pedido)
                .where(Pedido.usuario_id == usuario_id)
                .order_by(Pedido.created_at.desc())
            ).all()
        )

    def count_by_estado(self, estado: str) -> int:
        result = self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.estado == estado)
        ).one()
        return int(result or 0)