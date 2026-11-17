import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useForm } from "@tanstack/react-form";
import type { Categoria } from "@/shared/types/api";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  fetchCategoriasAdmin,
} from "../api";

const columnHelper = createColumnHelper<Categoria>();

interface FormValues {
  nombre: string;
  descripcion: string;
}

interface EditState {
  id: number | null;
  initial: FormValues;
}

function CategoriaForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: EditState;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const mutation = useMutation({
    mutationFn: async (value: FormValues) => {
      const payload = {
        nombre: value.nombre,
        descripcion: value.descripcion || null,
      };
      if (initial.id === null) return crearCategoria(payload);
      return actualizarCategoria(initial.id, payload);
    },
    onSuccess: onSaved,
  });

  const form = useForm({
    defaultValues: initial.initial,
    onSubmit: async ({ value }) => mutation.mutate(value),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
    >
      <h2 className="font-semibold">
        {initial.id ? "Editar categoría" : "Nueva categoría"}
      </h2>
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) =>
            value.length < 2 ? "Mínimo 2 caracteres" : undefined,
        }}
      >
        {(field) => (
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="mt-1 text-xs text-red-600">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <div>
            <label className="mb-1 block text-sm font-medium">
              Descripción
            </label>
            <textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              rows={2}
            />
          </div>
        )}
      </form.Field>
      {mutation.error !== null && (
        <p className="text-sm text-red-600">
          {(mutation.error as { response?: { data?: { detail?: string } } })
            ?.response?.data?.detail ?? "Error al guardar"}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function CategoriasAdminPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<EditState | null>(null);

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["admin-categorias"],
    queryFn: fetchCategoriasAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categorias"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("nombre", { header: "Nombre" }),
      columnHelper.accessor("descripcion", {
        header: "Descripción",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() =>
                setEditing({
                  id: row.original.id,
                  initial: {
                    nombre: row.original.nombre,
                    descripcion: row.original.descripcion ?? "",
                  },
                })
              }
              className="text-sm text-blue-600 hover:underline"
            >
              Editar
            </button>
            <button
              onClick={() => {
                if (window.confirm(`¿Dar de baja "${row.original.nombre}"?`)) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </div>
        ),
      }),
    ],
    [deleteMutation],
  );

  const table = useReactTable({
    data: categorias,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categorias"] });
    queryClient.invalidateQueries({ queryKey: ["categorias"] });
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <button
          onClick={() =>
            setEditing({ id: null, initial: { nombre: "", descripcion: "" } })
          }
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Nueva categoría
        </button>
      </div>

      {editing && (
        <CategoriaForm
          key={editing.id ?? "new"}
          initial={editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      )}

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
        {!isLoading && categorias.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            No hay categorías cargadas.
          </p>
        )}
      </div>
    </div>
  );
}