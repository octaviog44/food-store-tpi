import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchResumen } from "./api";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-resumen"],
    queryFn: fetchResumen,
  });

  const cards = [
    { label: "Total", value: data?.total ?? 0, color: "bg-gray-100 text-gray-800" },
    { label: "Pendientes", value: data?.pendientes ?? 0, color: "bg-yellow-100 text-yellow-800" },
    { label: "En preparación", value: data?.en_preparacion ?? 0, color: "bg-blue-100 text-blue-800" },
    { label: "Entregados", value: data?.entregados ?? 0, color: "bg-green-100 text-green-800" },
    { label: "Cancelados", value: data?.cancelados ?? 0, color: "bg-red-100 text-red-800" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Resumen del negocio</h1>
      {isLoading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {cards.map((c) => (
              <div
                key={c.label}
                className={`rounded-lg border border-gray-200 p-4 ${c.color}`}
              >
                <p className="text-sm font-medium">{c.label}</p>
                <p className="mt-1 text-3xl font-bold">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Link
              to="/admin/pedidos"
              className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md"
            >
              <h2 className="font-semibold">Gestionar pedidos</h2>
              <p className="mt-1 text-sm text-gray-500">
                Avanzar o cancelar pedidos.
              </p>
            </Link>
            <Link
              to="/admin/productos"
              className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md"
            >
              <h2 className="font-semibold">Gestionar productos</h2>
              <p className="mt-1 text-sm text-gray-500">
                CRUD, stock y disponibilidad.
              </p>
            </Link>
            <Link
              to="/admin/categorias"
              className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md"
            >
              <h2 className="font-semibold">Gestionar categorías</h2>
              <p className="mt-1 text-sm text-gray-500">CRUD de categorías.</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}