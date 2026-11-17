import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Producto } from "@/shared/types/api";
import { fetchTodasCategorias } from "@/features/admin/categorias/api";
import { actualizarProducto, crearProducto } from "./api";

interface Props {
  producto: Producto | null;
  onClose: () => void;
}

export function ProductoModal({ producto, onClose }: Props) {
  const queryClient = useQueryClient();
  const esEdicion = producto !== null;

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: fetchTodasCategorias,
  });

  const mutation = useMutation({
    mutationFn: (values: {
      nombre: string;
      descripcion: string;
      precio_base: number;
      imagen_url: string;
      stock: number;
      disponible: boolean;
      categoria_id: number;
    }) => {
      const payload = {
        nombre: values.nombre,
        descripcion: values.descripcion || null,
        precio_base: values.precio_base,
        imagen_url: values.imagen_url || null,
        stock: values.stock,
        disponible: values.disponible,
        categoria_id: values.categoria_id,
      };
      return esEdicion
        ? actualizarProducto(producto.id, payload)
        : crearProducto(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-productos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      onClose();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(e?.response?.data?.detail ?? "No se pudo guardar el producto");
    },
  });

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? "",
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? 0,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">
          {esEdicion ? "Editar producto" : "Nuevo producto"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) => {
                const v = value.trim();
                if (v.length < 2) return "Mínimo 2 caracteres";
                if (v.length > 100) return "Máximo 100 caracteres";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  maxLength={100}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field
              name="precio_base"
              validators={{
                onChange: ({ value }) =>
                  value < 0 ? "Debe ser ≥ 0" : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Precio base *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(Number(e.target.value))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="stock"
              validators={{
                onChange: ({ value }) =>
                  value < 0 ? "Debe ser ≥ 0" : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(Number(e.target.value))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field
            name="categoria_id"
            validators={{
              onChange: ({ value }) =>
                value <= 0 ? "Elegí una categoría" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Categoría *
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(Number(e.target.value))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value={0}>— Elegí una categoría —</option>
                  {categorias?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="imagen_url">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  URL de imagen
                </label>
                <input
                  type="url"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="https://..."
                  maxLength={500}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="disponible">
            {(field) => (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                />
                <span className="font-medium text-gray-700">Disponible</span>
              </label>
            )}
          </form.Field>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending
                ? "Guardando..."
                : esEdicion
                  ? "Guardar cambios"
                  : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}