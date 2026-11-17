import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flexRender } from "@tanstack/react-table";
import {
  getCoreRowModel,
  legacyCreateColumnHelper,
  useLegacyTable,
} from "@tanstack/react-table/legacy";
import type { Producto } from "@/shared/types/api";
import { ProductoModal } from "./ProductoModal";
import {
  actualizarDisponibilidad,
  actualizarStock,
  eliminarProducto,
  fetchProductosAdmin,
} from "./api";

const columnHelper = legacyCreateColumnHelper<Producto>();

export function ProductosAdminPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-productos"],
    queryFn: fetchProductosAdmin,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-productos"] });
    queryClient.invalidateQueries({ queryKey: ["productos"] });
  };

  const stockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      actualizarStock(id, stock),
    onSuccess: invalidate,
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(e?.response?.data?.detail ?? "No se pudo actualizar el stock");
    },
  });

  const disponibleMutation = useMutation({
    mutationFn: ({ id, disponible }: { id: number; disponible: boolean }) =>
      actualizarDisponibilidad(id, disponible),
    onSuccess: invalidate,
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(
        e?.response?.data?.detail ?? "No se pudo cambiar la disponibilidad",
      );
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarProducto(id),
    onSuccess: invalidate,
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(e?.response?.data?.detail ?? "No se pudo eliminar");
    },
  });

  const columns = columnHelper.columns([
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("nombre", {
      header: "Nombre",
      cell: (info) => (
        <span className="font-medium text-gray-900">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("precio_base", {
      header: "Precio",
      cell: (info) => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor("stock", {
      header: "Stock",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                stockMutation.mutate({
                  id: p.id,
                  stock: Math.max(0, p.stock - 1),
                })
              }
              disabled={p.stock <= 0 || stockMutation.isPending}
              className="h-6 w-6 rounded border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-40"
            >
              −
            </button>
            <span className="w-10 text-center font-medium">{p.stock}</span>
            <button
              onClick={() =>
                stockMutation.mutate({ id: p.id, stock: p.stock + 1 })
              }
              disabled={stockMutation.isPending}
              className="h-6 w-6 rounded border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-40"
            >
              +
            </button>
          </div>
        );
      },
    }),
    columnHelper.accessor("disponible", {
      header: "Disponible",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <label className="inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={p.disponible}
              onChange={(e) =>
                disponibleMutation.mutate({
                  id: p.id,
                  disponible: e.target.checked,
                })
              }
              disabled={disponibleMutation.isPending}
            />
          </label>
        );
      },
    }),
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditando(row.original);
              setModalOpen(true);
            }}
            className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
          >
            Editar
          </button>
          <button
            onClick={() => {
              if (
                confirm(`¿Dar de baja el producto "${row.original.nombre}"?`)
              ) {
                eliminarMutation.mutate(row.original.id);
              }
            }}
            disabled={
              eliminarMutation.isPending &&
              eliminarMutation.variables === row.original.id
            }
            className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      ),
    }),
  ]);

  const table = useLegacyTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Productos{" "}
          <span className="text-sm font-normal text-gray-500">
            ({data?.total ?? 0})
          </span>
        </h2>
        <button
          onClick={() => {
            setEditando(null);
            setModalOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          + Nuevo producto
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Cargando productos...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
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
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {table.getRowModel().rows.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">
              No hay productos. Creá el primero.
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <ProductoModal
          producto={editando}
          onClose={() => {
            setModalOpen(false);
            setEditando(null);
          }}
        />
      )}
    </div>
  );
}