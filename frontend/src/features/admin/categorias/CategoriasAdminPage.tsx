import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flexRender } from "@tanstack/react-table";
import {
  getCoreRowModel,
  legacyCreateColumnHelper,
  useLegacyTable,
} from "@tanstack/react-table/legacy";
import type { Categoria } from "@/shared/types/api";
import { CategoriaModal } from "./CategoriaModal";
import { eliminarCategoria, fetchTodasCategorias } from "./api";

const columnHelper = legacyCreateColumnHelper<Categoria>();

export function CategoriasAdminPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categorias"],
    queryFn: fetchTodasCategorias,
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categorias"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
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
    columnHelper.accessor("descripcion", {
      header: "Descripción",
      cell: (info) => (
        <span className="text-sm text-gray-600">
          {info.getValue() || "—"}
        </span>
      ),
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
                confirm(
                  `¿Eliminar la categoría "${row.original.nombre}"? Los productos asociados quedan visibles pero la categoría no aparecerá en el catálogo.`,
                )
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
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Categorías</h2>
        <button
          onClick={() => {
            setEditando(null);
            setModalOpen(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          + Nueva categoría
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Cargando categorías...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-medium text-gray-700"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
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
              No hay categorías. Creá la primera.
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <CategoriaModal
          categoria={editando}
          onClose={() => {
            setModalOpen(false);
            setEditando(null);
          }}
        />
      )}
    </div>
  );
}