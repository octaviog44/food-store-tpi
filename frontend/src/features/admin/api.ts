import { api } from "@/shared/api/client";
import type {
  EstadoPedido,
  Pedido,
  ResumenPedidos,
} from "@/shared/types/api";

export async function fetchResumen(): Promise<ResumenPedidos> {
  const { data } = await api.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}

export async function fetchTodosPedidos(): Promise<Pedido[]> {
  const { data } = await api.get<Pedido[]>("/pedidos");
  return data;
}

export async function cambiarEstadoAdmin(
  id: number,
  estado: EstadoPedido,
): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, {
    estado,
  });
  return data;
}