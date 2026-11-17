import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Categoria } from "@/shared/types/api";
import { actualizarCategoria, crearCategoria } from "./api";

interface Props {
  categoria: Categoria | null; // null = crear
  onClose: () => void;
}

export function CategoriaModal({ categoria, onClose }: Props) {
  const queryClient = useQueryClient();
  const esEdicion = categoria !== null;

  const mutation = useMutation({
    mutationFn: (values: { nombre: string; descripcion: string }) =>
      esEdicion
        ? actualizarCategoria(categoria.id, {
            nombre: values.nombre,
            descripcion: values.descripcion || null,
          })
        : crearCategoria({
            nombre: values.nombre,
            descripcion: values.descripcion || null,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categorias"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      onClose();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(e?.response?.data?.detail ?? "No se pudo guardar la categoría");
    },
  });

  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? "",
      descripcion: categoria?.descripcion ?? "",
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
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">
          {esEdicion ? "Editar categoría" : "Nueva categoría"}
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
                  onBlur={field.handleBlur}
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
                  onBlur={field.handleBlur}
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
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
                  : "Crear categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}