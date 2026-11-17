import { useQuery } from "@tanstack/react-query";
import { fetchResumen } from "./api";
import type { ResumenPedidos } from "@/shared/types/api";

interface Card {
  key: keyof ResumenPedidos;
  label: string;
  color: string;
}

const CARDS: Card[] = [
  {
    key: "total",
    label: "Total de pedidos",
    color: "bg-gray-100 text-gray-800",
  },
  {
    key: "pendientes",
    label: "Pendientes",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    key: "en_preparacion",
    label: "En preparación",
    color: "bg-blue-100 text-blue-800",
  },
  {
    key: "entregados",
    label: "Entregados",
    color: "bg-green-100 text-green-800",
  },
  {
    key: "cancelados",
    label: "Cancelados",
    color: "bg-red-100 text-red-800",
  },
];

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-resumen"],
    queryFn: fetchResumen,
  });

  if (isLoading) {
    return <div className="text-gray-500">Cargando resumen...</div>;
  }

  if (isError || !data) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-red-700">
        No se pudo cargar el resumen.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((card) => (
          <div
            key={card.key}
            className={`rounded-lg p-4 ${card.color}`}
          >
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="mt-1 text-3xl font-bold">{data[card.key]}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold">Accesos rápidos</h2>
        <p className="text-sm text-gray-600">
          Usá las pestañas de arriba para gestionar pedidos, productos,
          categorías o usuarios.
        </p>
      </div>
    </div>
  );
}