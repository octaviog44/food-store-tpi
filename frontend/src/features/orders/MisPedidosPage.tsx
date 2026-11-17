import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cambiarEstadoPedido, fetchMisPedidos } from "./api";
import type { EstadoPedido, Pedido } from "@/shared/types/api";

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const ESTADO_COLOR: Record<EstadoPedido, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  EN_PREPARACION: "bg-blue-100 text-blue-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function MisPedidosPage() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["mis-pedidos"],
    queryFn: fetchMisPedidos,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cambiarEstadoPedido(id, "CANCELADO"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(e?.response?.data?.detail ?? "No se pudo cancelar el pedido");
    },
  });

  if (isLoading) {
    return <div className="text-gray-500">Cargando pedidos...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-600">Todavía no hiciste ningún pedido.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Mis pedidos</h1>
      <div className="space-y-3">
        {data.map((pedido) => (
          <OrderRow
            key={pedido.id}
            pedido={pedido}
            expanded={expanded === pedido.id}
            onToggle={() =>
              setExpanded(expanded === pedido.id ? null : pedido.id)
            }
            onCancel={() => {
              if (confirm("¿Cancelar este pedido?")) {
                cancelMutation.mutate(pedido.id);
              }
            }}
            cancelling={
              cancelMutation.isPending &&
              cancelMutation.variables === pedido.id
            }
          />
        ))}
      </div>
    </div>
  );
}

interface OrderRowProps {
  pedido: Pedido;
  expanded: boolean;
  onToggle: () => void;
  onCancel: () => void;
  cancelling: boolean;
}

function OrderRow({
  pedido,
  expanded,
  onToggle,
  onCancel,
  cancelling,
}: OrderRowProps) {
  const puedeCancelar = pedido.estado === "PENDIENTE";
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-gray-900">
            Pedido #{pedido.id}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              ESTADO_COLOR[pedido.estado]
            }`}
          >
            {ESTADO_LABEL[pedido.estado]}
          </span>
          <span className="text-sm text-gray-500">
            {formatDate(pedido.created_at)}
          </span>
        </div>
        <span className="font-semibold text-gray-900">
          ${pedido.total.toFixed(2)}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 p-4">
          <div className="mb-3 text-sm text-gray-700">
            <p>
              <span className="font-medium">Dirección:</span>{" "}
              {pedido.direccion_entrega}
            </p>
            <p>
              <span className="font-medium">Forma de pago:</span>{" "}
              {pedido.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"}
            </p>
            {pedido.notas && (
              <p>
                <span className="font-medium">Notas:</span> {pedido.notas}
              </p>
            )}
          </div>

          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 text-left text-gray-600">
              <tr>
                <th className="py-2">Producto</th>
                <th className="py-2 text-center">Cant.</th>
                <th className="py-2 text-right">Precio</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-2">{item.nombre_producto}</td>
                  <td className="py-2 text-center">{item.cantidad}</td>
                  <td className="py-2 text-right">
                    ${item.precio_unitario.toFixed(2)}
                  </td>
                  <td className="py-2 text-right">
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {puedeCancelar && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={onCancel}
                disabled={cancelling}
                className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {cancelling ? "Cancelando..." : "Cancelar pedido"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}