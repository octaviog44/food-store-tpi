import { api } from "@/shared/api/client";
import type {
  Producto,
  ProductoCreate,
  ProductosPaginados,
} from "@/shared/types/api";

export async function fetchProductosAdmin(): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>(
    "/productos?skip=0&limit=100",
  );
  return data;
}

export async function crearProducto(
  payload: ProductoCreate,
): Promise<Producto> {
  const { data } = await api.post<Producto>("/productos", payload);
  return data;
}

export async function actualizarProducto(
  id: number,
  payload: Partial<ProductoCreate>,
): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, payload);
  return data;
}

export async function actualizarStock(
  id: number,
  stock: number,
): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, {
    stock,
  });
  return data;
}

export async function actualizarDisponibilidad(
  id: number,
  disponible: boolean,
): Promise<Producto> {
  const { data } = await api.patch<Producto>(
    `/productos/${id}/disponibilidad`,
    { disponible },
  );
  return data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}