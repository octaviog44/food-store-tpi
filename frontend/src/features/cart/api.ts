import { api } from "@/shared/api/client";
import type { Pedido, PedidoCreate } from "@/shared/types/api";

export async function createPedido(data: PedidoCreate): Promise<Pedido> {
  const res = await api.post<Pedido>("/pedidos", data);
  return res.data;
}