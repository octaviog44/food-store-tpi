import { Link, useNavigate } from "react-router-dom";
import {
  cartTotal,
  useCartStore,
} from "@/features/cart/store";
import { useAuthStore } from "@/features/auth/store";

export function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, removeItem, setCantidad, clear } = useCartStore();
  const total = cartTotal(items);

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="mb-4 text-gray-600">Tu carrito está vacío.</p>
        <Link
          to="/"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Carrito</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.producto_id}
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                <img
                  src={
                    item.imagen_url ||
                    "https://placehold.co/100x100?text=?"
                  }
                  alt={item.nombre}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.nombre}</h3>
                <p className="text-sm text-gray-500">
                  ${item.precio_unitario.toFixed(2)} c/u
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCantidad(item.producto_id, item.cantidad - 1)
                  }
                  className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-100"
                  disabled={item.cantidad <= 1}
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">
                  {item.cantidad}
                </span>
                <button
                  onClick={() =>
                    setCantidad(item.producto_id, item.cantidad + 1)
                  }
                  className="h-8 w-8 rounded border border-gray-300 hover:bg-gray-100"
                  disabled={item.cantidad >= item.stock}
                >
                  +
                </button>
              </div>
              <div className="w-20 text-right font-semibold">
                ${(item.precio_unitario * item.cantidad).toFixed(2)}
              </div>
              <button
                onClick={() => removeItem(item.producto_id)}
                className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                title="Quitar"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={clear}
            className="text-sm text-red-600 hover:underline"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="h-fit rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Resumen</h2>
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>Productos</span>
            <span>
              {items.reduce((n, i) => n + i.cantidad, 0)}
            </span>
          </div>
          <div className="mb-4 flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {user ? "Ir al checkout" : "Ingresar para pedir"}
          </button>
        </div>
      </div>
    </div>
  );
}