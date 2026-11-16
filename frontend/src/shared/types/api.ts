export type Role = "user" | "admin";

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  disabled: boolean;
  created_at: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string | null;
}

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
}

export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

export interface ProductoCreate {
  categoria_id: number;
  nombre: string;
  descripcion?: string | null;
  precio_base: number;
  imagen_url?: string | null;
  stock: number;
  disponible?: boolean;
}

export type EstadoPedido =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "ENTREGADO"
  | "CANCELADO";

export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

export interface DetallePedido {
  id: number;
  producto_id: number;
  cantidad: number;
  nombre_producto: string;
  precio_unitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
}

export interface PedidoCreate {
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas?: string | null;
  items: { producto_id: number; cantidad: number }[];
}

export interface ResumenPedidos {
  total: number;
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
}