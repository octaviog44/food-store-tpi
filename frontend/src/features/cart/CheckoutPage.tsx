import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useCartStore, cartTotal } from "./store";
import { createPedido } from "@/features/orders/api";
import type { FormaPago } from "@/shared/types/api";

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, clear } = useCartStore();
  const total = cartTotal(items);

  const mutation = useMutation({
    mutationFn: createPedido,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      clear();
      navigate("/mis-pedidos");
    },
  });

  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      notas: "",
      forma_pago: "EFECTIVO" as FormaPago,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        direccion_entrega: value.direccion_entrega,
        notas: value.notas || null,
        forma_pago: value.forma_pago,
        items: items.map((i) => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad,
        })),
      });
    },
  });

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="mb-4 text-gray-500">No hay items en el carrito.</p>
        <button
          onClick={() => navigate("/")}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Ver catálogo
        </button>
      </div>
    );
  }

  const errorDetail =
    (mutation.error as { response?: { data?: { detail?: string } } } | null)
      ?.response?.data?.detail ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Resumen del pedido</h2>
        <ul className="space-y-1 text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span>${(i.precio_unitario * i.cantidad).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4 rounded-lg border border-gray-200 bg-white p-4"
      >
        <form.Field
          name="direccion_entrega"
          validators={{
            onChange: ({ value }) => {
              if (value.length < 5) return "Mínimo 5 caracteres";
              if (value.length > 200) return "Máximo 200 caracteres";
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Dirección de entrega
              </label>
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-xs text-red-600">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="notas">
          {(field) => (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Notas (opcional)
              </label>
              <textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="forma_pago">
          {(field) => (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Forma de pago
              </label>
              <select
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value as FormaPago)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
          )}
        </form.Field>

        {errorDetail && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorDetail}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? "Creando pedido..." : "Confirmar pedido"}
        </button>
      </form>
    </div>
  );
}