import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cambiarEstadoPedido, fetchAllPedidos, fetchUsuarios } from "./api";
import type { EstadoPedido, Pedido, User } from "@/shared/types/api";

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

const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

const columnHelper = createColumnHelper<Pedido>();

export function PedidosAdminPage() {
  const queryClient = useQueryClient();

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ["admin-pedidos"],
    queryFn: fetchAllPedidos,
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: fetchUsuarios,
  });

  const userMap = useMemo(() => {
    const m = new Map<number, User>();
    usuarios.forEach((u) => m.set(u.id, u));
    return m;
  }, [usuarios]);

  const mutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resumen"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => `#${info.getValue()}`,
      }),
      columnHelper.accessor("usuario_id", {
        header: "Cliente",
        cell: (info) =>
          userMap.get(info.getValue())?.username ?? `#${info.getValue()}`,
      }),
      columnHelper.accessor("created_at", {
        header: "Fecha",
        cell: (info) => new Date(info.getValue()).toLocaleString("es-AR"),
      }),
      columnHelper.accessor("estado", {
        header: "Estado",
        cell: (info) => {
          const e = info.getValue();
          return (
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${ESTADO_COLOR[e]}`}
            >
              {ESTADO_LABEL[e]}
            </span>
          );
        },
      }),
      columnHelper.accessor("total", {
        header: "Total",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const p = row.original;
          const opciones = TRANSICIONES[p.estado];
          if (opciones.length === 0)
            return <span className="text-xs text-gray-400">—</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {opciones.map((op) => (
                <button
                  key={op}
                  onClick={() => mutation.mutate({ id: p.id, estado: op })}
                  disabled={mutation.isPending}
                  className={`rounded px-2 py-1 text-xs text-white ${
                    op === "CANCELADO"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } disabled:opacity-50`}
                >
                  {ESTADO_LABEL[op]}
                </button>
              ))}
            </div>
          );
        },
      }),
    ],
    [userMap, mutation],
  );

  const table = useReactTable({
    data: pedidos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p className="text-gray-500">Cargando pedidos...</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Pedidos</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-4 py-3 text-left font-medium text-gray-700"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {pedidos.length === 0 && (
          <p className="p-8 text-center text-gray-500">No hay pedidos todavía.</p>
        )}
      </div>
    </div>
  );
}