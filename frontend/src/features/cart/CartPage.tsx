import { Link } from "react-router-dom";
import { useCartStore, cartTotal } from "./store";
import { useAuthStore } from "@/features/auth/store";

export function CartPage() {
  const { items, setCantidad, removeItem, clear } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const total = cartTotal(items);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="mb-4 text-gray-500">Tu carrito está vacío.</p>
        <Link
          to="/"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Carrito</h1>

      <div className="rounded-lg border border-gray-200 bg-white">
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
              <img
                src={item.imagen_url || "https://placehold.co/80x80?text=?"}
                alt={item.nombre}
                className="h-20 w-20 rounded object-cover"
              />
              <div className="flex-1 min-w-[140px]">
                <p className="font-medium text-gray-900">{item.nombre}</p>
                <p className="text-sm text-gray-500">
                  ${item.precio_unitario.toFixed(2)} c/u
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCantidad(item.producto_id, item.cantidad - 1)
                  }
                  disabled={item.cantidad <= 1}
                  className="h-8 w-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  −
                </button>
                <span className="w-8 text-center">{item.cantidad}</span>
                <button
                  onClick={() =>
                    setCantidad(item.producto_id, item.cantidad + 1)
                  }
                  disabled={item.cantidad >= item.stock}
                  className="h-8 w-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <p className="w-24 text-right font-medium">
                ${(item.precio_unitario * item.cantidad).toFixed(2)}
              </p>
              <button
                onClick={() => removeItem(item.producto_id)}
                className="text-sm text-red-600 hover:underline"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <button
          onClick={clear}
          className="text-sm text-red-600 hover:underline"
        >
          Vaciar carrito
        </button>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">${total.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex justify-end">
        {user ? (
          <Link
            to="/checkout"
            className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Ir al checkout
          </Link>
        ) : (
          <Link
            to="/login"
            className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Iniciar sesión para continuar
          </Link>
        )}
      </div>
    </div>
  );
}