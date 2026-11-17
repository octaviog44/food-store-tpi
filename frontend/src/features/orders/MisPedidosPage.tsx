import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelarPedido, fetchMisPedidos } from "./api";
import type { EstadoPedido, Pedido } from "@/shared/types/api";

const ESTADO_COLOR: Record<EstadoPedido, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  EN_PREPARACION: "bg-blue-100 text-blue-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
};

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export function MisPedidosPage() {
  const queryClient = useQueryClient();

  const { data: pedidos, isLoading } = useQuery({
    queryKey: ["mis-pedidos"],
    queryFn: fetchMisPedidos,
  });

  const cancelar = useMutation({
    mutationFn: cancelarPedido,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });

  if (isLoading) {
    return <div className="text-gray-500">Cargando pedidos...</div>;
  }

  if (!pedidos || pedidos.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">Todavía no tenés pedidos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mis pedidos</h1>

      {pedidos.map((p) => (
        <PedidoCard
          key={p.id}
          pedido={p}
          onCancelar={() => cancelar.mutate(p.id)}
          cancelando={cancelar.isPending && cancelar.variables === p.id}
        />
      ))}
    </div>
  );
}

interface PedidoCardProps {
  pedido: Pedido;
  onCancelar: () => void;
  cancelando: boolean;
}

function PedidoCard({ pedido, onCancelar, cancelando }: PedidoCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">Pedido #{pedido.id}</p>
          <p className="text-sm text-gray-500">
            {new Date(pedido.created_at).toLocaleString("es-AR")}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${ESTADO_COLOR[pedido.estado]}`}
        >
          {ESTADO_LABEL[pedido.estado]}
        </span>
      </div>

      <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
        {pedido.items.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.cantidad} × {item.nombre_producto}
            </span>
            <span>${item.subtotal.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm text-gray-600">
        <p>
          <strong>Dirección:</strong> {pedido.direccion_entrega}
        </p>
        <p>
          <strong>Forma de pago:</strong> {pedido.forma_pago}
        </p>
        {pedido.notas && (
          <p>
            <strong>Notas:</strong> {pedido.notas}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-lg font-bold">${pedido.total.toFixed(2)}</span>
        {pedido.estado === "PENDIENTE" && (
          <button
            onClick={onCancelar}
            disabled={cancelando}
            className="rounded-md bg-red-600 px-4 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            {cancelando ? "Cancelando..." : "Cancelar pedido"}
          </button>
        )}
      </div>
    </div>
  );
}