import { api } from "@/shared/api/client";
import type { EstadoPedido, Pedido } from "@/shared/types/api";

export async function fetchMisPedidos(): Promise<Pedido[]> {
  const { data } = await api.get<Pedido[]>("/pedidos/mis-pedidos");
  return data;
}

export async function fetchPedido(id: number): Promise<Pedido> {
  const { data } = await api.get<Pedido>(`/pedidos/${id}`);
  return data;
}

export async function cambiarEstadoPedido(
  id: number,
  estado: EstadoPedido,
): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, {
    estado,
  });
  return data;
}