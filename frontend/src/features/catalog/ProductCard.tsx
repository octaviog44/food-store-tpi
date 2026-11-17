import type { Producto } from "@/shared/types/api";
import { useCartStore } from "@/features/cart/store";

interface Props {
  producto: Producto;
}

export function ProductCard({ producto }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const sinStock = producto.stock <= 0 || !producto.disponible;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="aspect-video bg-gray-100">
        <img
          src={
            producto.imagen_url ||
            "https://placehold.co/400x300?text=Sin+imagen"
          }
          alt={producto.nombre}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-gray-900">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-600">
            {producto.descripcion}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${producto.precio_base.toFixed(2)}
          </span>
          <span
            className={`text-xs ${
              sinStock ? "text-red-500" : "text-gray-500"
            }`}
          >
            {sinStock ? "Sin stock" : `Stock: ${producto.stock}`}
          </span>
        </div>
        <button
          onClick={() => addItem(producto)}
          disabled={sinStock}
          className="mt-3 w-full rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {sinStock ? "No disponible" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}