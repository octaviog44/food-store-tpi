import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cambiarEstadoAdmin,
  fetchTodosPedidos,
} from "./api";
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

// Transiciones válidas para admin (desde cualquier estado no terminal)
const ACCIONES: Record<
  EstadoPedido,
  { label: string; estado: EstadoPedido; variant: "primary" | "danger" }[]
> = {
  PENDIENTE: [
    {
      label: "Iniciar preparación",
      estado: "EN_PREPARACION",
      variant: "primary",
    },
    { label: "Cancelar", estado: "CANCELADO", variant: "danger" },
  ],
  EN_PREPARACION: [
    { label: "Marcar entregado", estado: "ENTREGADO", variant: "primary" },
    { label: "Cancelar", estado: "CANCELADO", variant: "danger" },
  ],
  ENTREGADO: [],
  CANCELADO: [],
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function PedidosAdminPage() {
  const queryClient = useQueryClient();
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | "">("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-pedidos"],
    queryFn: fetchTodosPedidos,
  });

  const mutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoAdmin(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resumen"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(e?.response?.data?.detail ?? "No se pudo actualizar el pedido");
    },
  });

  if (isLoading) {
    return <div className="text-gray-500">Cargando pedidos...</div>;
  }

  if (isError || !data) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-red-700">
        No se pudieron cargar los pedidos.
      </div>
    );
  }

  const filtered =
    filtroEstado === ""
      ? data
      : data.filter((p) => p.estado === filtroEstado);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Pedidos</h2>
        <select
          value={filtroEstado}
          onChange={(e) =>
            setFiltroEstado(e.target.value as EstadoPedido | "")
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparación</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500">
          No hay pedidos con ese filtro.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((pedido) => (
            <PedidoRowAdmin
              key={pedido.id}
              pedido={pedido}
              expanded={expanded === pedido.id}
              onToggle={() =>
                setExpanded(expanded === pedido.id ? null : pedido.id)
              }
              onCambiarEstado={(estado) => {
                const accion = ACCIONES[pedido.estado].find(
                  (a) => a.estado === estado,
                );
                if (
                  accion?.variant === "danger" &&
                  !confirm("¿Cancelar este pedido? Se restituirá el stock.")
                ) {
                  return;
                }
                mutation.mutate({ id: pedido.id, estado });
              }}
              pending={
                mutation.isPending &&
                mutation.variables?.id === pedido.id
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RowProps {
  pedido: Pedido;
  expanded: boolean;
  onToggle: () => void;
  onCambiarEstado: (estado: EstadoPedido) => void;
  pending: boolean;
}

function PedidoRowAdmin({
  pedido,
  expanded,
  onToggle,
  onCambiarEstado,
  pending,
}: RowProps) {
  const acciones = ACCIONES[pedido.estado];

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <button
          onClick={onToggle}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <span className="font-semibold text-gray-900">
            #{pedido.id}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              ESTADO_COLOR[pedido.estado]
            }`}
          >
            {ESTADO_LABEL[pedido.estado]}
          </span>
          <span className="text-sm text-gray-500">
            Cliente #{pedido.usuario_id}
          </span>
          <span className="text-sm text-gray-500">
            {formatDate(pedido.created_at)}
          </span>
          <span className="ml-auto font-semibold text-gray-900">
            ${pedido.total.toFixed(2)}
          </span>
        </button>

        <div className="flex gap-2">
          {acciones.map((accion) => (
            <button
              key={accion.estado}
              onClick={() => onCambiarEstado(accion.estado)}
              disabled={pending}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                accion.variant === "primary"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-red-300 bg-white text-red-600 hover:bg-red-50"
              } disabled:opacity-50`}
            >
              {accion.label}
            </button>
          ))}
          {acciones.length === 0 && (
            <span className="text-xs text-gray-400">
              Sin acciones disponibles
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 p-4">
          <div className="mb-3 text-sm text-gray-700">
            <p>
              <span className="font-medium">Dirección:</span>{" "}
              {pedido.direccion_entrega}
            </p>
            <p>
              <span className="font-medium">Forma de pago:</span>{" "}
              {pedido.forma_pago === "EFECTIVO"
                ? "Efectivo"
                : "Transferencia"}
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
        </div>
      )}
    </div>
  );
}