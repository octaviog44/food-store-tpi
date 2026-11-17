import { api } from "@/shared/api/client";
import type {
  Categoria,
  Producto,
  ProductosPaginados,
} from "@/shared/types/api";

export async function fetchCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>("/categorias");
  return data;
}

export interface ProductosFilters {
  skip?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}

export async function fetchProductos(
  filters: ProductosFilters = {},
): Promise<ProductosPaginados> {
  const params = new URLSearchParams();
  if (filters.skip !== undefined) params.set("skip", String(filters.skip));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.categoria_id !== undefined)
    params.set("categoria_id", String(filters.categoria_id));
  if (filters.disponible !== undefined)
    params.set("disponible", String(filters.disponible));

  const { data } = await api.get<ProductosPaginados>(
    `/productos?${params.toString()}`,
  );
  return data;
}

export async function fetchProducto(id: number): Promise<Producto> {
  const { data } = await api.get<Producto>(`/productos/${id}`);
  return data;
}