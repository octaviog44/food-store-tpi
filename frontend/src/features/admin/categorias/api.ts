import { api } from "@/shared/api/client";
import type { Categoria, CategoriaCreate } from "@/shared/types/api";

export async function fetchTodasCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>("/categorias");
  return data;
}

export async function crearCategoria(
  payload: CategoriaCreate,
): Promise<Categoria> {
  const { data } = await api.post<Categoria>("/categorias", payload);
  return data;
}

export async function actualizarCategoria(
  id: number,
  payload: CategoriaCreate,
): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, payload);
  return data;
}

export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}