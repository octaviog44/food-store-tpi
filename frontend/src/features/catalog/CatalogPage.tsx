import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategorias, fetchProductos } from "./api";
import { ProductCard } from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";
import { useDebounce } from "@/shared/hooks/useDebounce";

const PAGE_SIZE = 12;

export function CatalogPage() {
  const [search, setSearch] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebounce(search, 300);

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: fetchCategorias,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["productos", debouncedSearch, categoriaId, page],
    queryFn: () =>
      fetchProductos({
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        categoria_id: categoriaId,
      }),
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Catálogo</h1>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
        <select
          value={categoriaId ?? ""}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined);
            setPage(0);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && data && data.items.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">No se encontraron productos.</p>
        </div>
      )}

      {!isLoading && data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.items.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {page + 1} de {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={page >= totalPages - 1}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}