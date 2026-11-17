import { api } from "@/shared/api/client";
import type { Pedido, PedidoCreate } from "@/shared/types/api";

export async function createPedido(data: PedidoCreate): Promise<Pedido> {
  const res = await api.post<Pedido>("/pedidos", data);
  return res.data;
}

export async function fetchMisPedidos(): Promise<Pedido[]> {
  const { data } = await api.get<Pedido[]>("/pedidos/mis-pedidos");
  return data;
}

export async function fetchPedido(id: number): Promise<Pedido> {
  const { data } = await api.get<Pedido>(`/pedidos/${id}`);
  return data;
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, {
    estado: "CANCELADO",
  });
  return data;
}