import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { cartTotal, useCartStore } from "@/features/cart/store";
import { createPedido } from "./api";
import type { FormaPago } from "@/shared/types/api";

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, clear } = useCartStore();
  const total = cartTotal(items);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSubmitting(true);
      try {
        await createPedido({
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
          items: items.map((i) => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
          })),
        });
        clear();
        queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
        navigate("/mis-pedidos");
      } catch (err: unknown) {
        const e = err as {
          response?: { data?: { detail?: unknown } };
        };
        const detail = e?.response?.data?.detail;
        setError(
          typeof detail === "string"
            ? detail
            : "No se pudo crear el pedido. Intentá de nuevo.",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (items.length === 0) {
    navigate("/carrito");
    return null;
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Confirmar pedido</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="grid gap-6 lg:grid-cols-3"
      >
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <form.Field
              name="direccion_entrega"
              validators={{
                onChange: ({ value }) => {
                  const v = value.trim();
                  if (v.length < 5) return "Mínimo 5 caracteres";
                  if (v.length > 200) return "Máximo 200 caracteres";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Dirección de entrega *
                  </label>
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    maxLength={200}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="Ej: Av. Siempreviva 742"
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

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <form.Field name="forma_pago">
              {(field) => (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Forma de pago *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        value="EFECTIVO"
                        checked={field.state.value === "EFECTIVO"}
                        onChange={() => field.handleChange("EFECTIVO")}
                      />
                      <span>Efectivo</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        value="TRANSFERENCIA"
                        checked={field.state.value === "TRANSFERENCIA"}
                        onChange={() => field.handleChange("TRANSFERENCIA")}
                      />
                      <span>Transferencia</span>
                    </label>
                  </div>
                </div>
              )}
            </form.Field>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <form.Field name="notas">
              {(field) => (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    maxLength={500}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="Ej: Sin cebolla, tocar timbre..."
                  />
                </div>
              )}
            </form.Field>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="h-fit rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold">Tu pedido</h2>
          <ul className="mb-4 space-y-2 text-sm">
            {items.map((i) => (
              <li
                key={i.producto_id}
                className="flex justify-between text-gray-700"
              >
                <span>
                  {i.cantidad}× {i.nombre}
                </span>
                <span>${(i.precio_unitario * i.cantidad).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? "Enviando..." : "Confirmar pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}