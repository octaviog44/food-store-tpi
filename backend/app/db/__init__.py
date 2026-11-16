from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

_namespace = {
    "Usuario": Usuario,
    "Categoria": Categoria,
    "Producto": Producto,
    "Pedido": Pedido,
    "DetallePedido": DetallePedido,
}

Usuario.model_rebuild(_types_namespace=_namespace, force=True)
Categoria.model_rebuild(_types_namespace=_namespace, force=True)
Producto.model_rebuild(_types_namespace=_namespace, force=True)
Pedido.model_rebuild(_types_namespace=_namespace, force=True)
DetallePedido.model_rebuild(_types_namespace=_namespace, force=True)