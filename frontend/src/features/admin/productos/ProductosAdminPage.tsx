import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useForm } from "@tanstack/react-form";
import type { Categoria, Producto } from "@/shared/types/api";
import { fetchProductos } from "@/features/catalog/api";
import {
  actualizarProducto,
  cambiarDisponibilidad,
  cambiarStock,
  crearProducto,
  eliminarProducto,
  fetchCategoriasAdmin,
} from "../api";

const columnHelper = createColumnHelper<Producto>();

interface FormValues {
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

interface EditState {
  id: number | null;
  initial: FormValues;
}

function ProductoForm({
  initial,
  categorias,
  onSaved,
  onCancel,
}: {
  initial: EditState;
  categorias: Categoria[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const mutation = useMutation({
    mutationFn: async (v: FormValues) => {
      
      if (initial.id === null) {
        return crearProducto({
          nombre: v.nombre,
          descripcion: v.descripcion || null,
          precio_base: v.precio_base,
          imagen_url: v.imagen_url || null,
          stock: v.stock,
          disponible: v.disponible,
          categoria_id: v.categoria_id,
        });
      }

      
      // 1. PUT con todos los campos excepto stock
      const actualizado = await actualizarProducto(initial.id, {
        nombre: v.nombre,
        descripcion: v.descripcion || null,
        precio_base: v.precio_base,
        imagen_url: v.imagen_url || null,
        disponible: v.disponible,
        categoria_id: v.categoria_id,
      });

      // 2. PATCH de stock SOLO si cambió
      if (v.stock !== initial.initial.stock) {
        await cambiarStock(initial.id, v.stock);
      }

      return actualizado;
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
        {initial.id ? "Editar producto" : "Nuevo producto"}
      </h2>

      <form.Field name="nombre">
        {(field) => (
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
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

      <div className="grid grid-cols-2 gap-3">
        <form.Field name="precio_base">
          {(field) => (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Precio base
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="stock">
          {(field) => (
            <div>
              <label className="mb-1 block text-sm font-medium">Stock</label>
              <input
                type="number"
                min={0}
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="categoria_id">
        {(field) => (
          <div>
            <label className="mb-1 block text-sm font-medium">Categoría</label>
            <select
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </form.Field>

      <form.Field name="imagen_url">
        {(field) => (
          <div>
            <label className="mb-1 block text-sm font-medium">
              URL de imagen
            </label>
            <input
              type="text"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible para la venta
          </label>
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

export function ProductosAdminPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<EditState | null>(null);

  const { data: categorias = [] } = useQuery({
    queryKey: ["admin-categorias"],
    queryFn: fetchCategoriasAdmin,
  });

  const { data: paginados, isLoading } = useQuery({
    queryKey: ["admin-productos"],
    queryFn: () => fetchProductos({ skip: 0, limit: 100 }),
  });

  const productos = paginados?.items ?? [];

  const deleteMutation = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-productos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      cambiarStock(id, stock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-productos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });

  const disponibleMutation = useMutation({
    mutationFn: ({ id, disponible }: { id: number; disponible: boolean }) =>
      cambiarDisponibilidad(id, disponible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-productos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("nombre", { header: "Nombre" }),
      columnHelper.accessor("precio_base", {
        header: "Precio",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor("stock", {
        header: "Stock",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="w-8 text-right">{row.original.stock}</span>
            <button
              onClick={() => {
                const nuevo = window.prompt(
                  `Nuevo stock para "${row.original.nombre}":`,
                  String(row.original.stock),
                );
                if (nuevo !== null && !Number.isNaN(Number(nuevo))) {
                  stockMutation.mutate({
                    id: row.original.id,
                    stock: Number(nuevo),
                  });
                }
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              cambiar
            </button>
          </div>
        ),
      }),
      columnHelper.accessor("disponible", {
        header: "Disponible",
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.original.disponible}
            onChange={(e) =>
              disponibleMutation.mutate({
                id: row.original.id,
                disponible: e.target.checked,
              })
            }
          />
        ),
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
                    precio_base: row.original.precio_base,
                    imagen_url: row.original.imagen_url ?? "",
                    stock: row.original.stock,
                    disponible: row.original.disponible,
                    categoria_id: row.original.categoria_id,
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
    [stockMutation, disponibleMutation, deleteMutation],
  );

  const table = useReactTable({
    data: productos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-productos"] });
    queryClient.invalidateQueries({ queryKey: ["productos"] });
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <button
          onClick={() =>
            setEditing({
              id: null,
              initial: {
                nombre: "",
                descripcion: "",
                precio_base: 0,
                imagen_url: "",
                stock: 0,
                disponible: true,
                categoria_id: categorias[0]?.id ?? 0,
              },
            })
          }
          disabled={categorias.length === 0}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Nuevo producto
        </button>
      </div>

      {categorias.length === 0 && (
        <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Primero creá al menos una categoría para poder crear productos.
        </p>
      )}

      {editing && (
        <ProductoForm
          key={editing.id ?? "new"}
          initial={editing}
          categorias={categorias}
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
        {!isLoading && productos.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            No hay productos cargados.
          </p>
        )}
      </div>
    </div>
  );
}