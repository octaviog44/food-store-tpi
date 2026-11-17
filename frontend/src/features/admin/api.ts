import { api } from "@/shared/api/client";
import type {
  Categoria,
  CategoriaCreate,
  EstadoPedido,
  Pedido,
  Producto,
  ProductoCreate,
  ResumenPedidos,
  User,
} from "@/shared/types/api";

// Pedidos
export async function fetchAllPedidos(): Promise<Pedido[]> {
  const { data } = await api.get<Pedido[]>("/pedidos");
  return data;
}

export async function fetchResumen(): Promise<ResumenPedidos> {
  const { data } = await api.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}

export async function cambiarEstadoPedido(
  id: number,
  estado: EstadoPedido,
): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  return data;
}

// Categorías
export async function fetchCategoriasAdmin(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>("/categorias");
  return data;
}

export async function crearCategoria(
  data: CategoriaCreate,
): Promise<Categoria> {
  const res = await api.post<Categoria>("/categorias", data);
  return res.data;
}

export async function actualizarCategoria(
  id: number,
  data: Partial<CategoriaCreate>,
): Promise<Categoria> {
  const res = await api.put<Categoria>(`/categorias/${id}`, data);
  return res.data;
}

export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}

// Productos
export async function crearProducto(data: ProductoCreate): Promise<Producto> {
  const res = await api.post<Producto>("/productos", data);
  return res.data;
}

export interface ProductoUpdatePayload {
  nombre?: string;
  descripcion?: string | null;
  precio_base?: number;
  imagen_url?: string | null;
  disponible?: boolean;
  categoria_id?: number;
}

export async function actualizarProducto(
  id: number,
  data: ProductoUpdatePayload,
): Promise<Producto> {
  const res = await api.put<Producto>(`/productos/${id}`, data);
  return res.data;
}

export async function cambiarStock(
  id: number,
  stock: number,
): Promise<Producto> {
  const res = await api.patch<Producto>(`/productos/${id}/stock`, { stock });
  return res.data;
}

export async function cambiarDisponibilidad(
  id: number,
  disponible: boolean,
): Promise<Producto> {
  const res = await api.patch<Producto>(`/productos/${id}/disponibilidad`, {
    disponible,
  });
  return res.data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}

// Usuarios
export async function fetchUsuarios(): Promise<User[]> {
  const { data } = await api.get<User[]>("/admin/usuarios");
  return data;
}

export async function activarUsuario(id: number): Promise<User> {
  const { data } = await api.post<User>(`/admin/usuarios/${id}/activar`);
  return data;
}

export async function desactivarUsuario(id: number): Promise<User> {
  const { data } = await api.post<User>(`/admin/usuarios/${id}/desactivar`);
  return data;
}