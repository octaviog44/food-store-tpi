import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Producto } from "@/shared/types/api";

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url: string | null;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (producto: Producto) => void;
  removeItem: (producto_id: number) => void;
  setCantidad: (producto_id: number, cantidad: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (producto) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.producto_id === producto.id,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.id
                  ? {
                      ...i,
                      cantidad: Math.min(i.cantidad + 1, producto.stock),
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                cantidad: 1,
                imagen_url: producto.imagen_url,
                stock: producto.stock,
              },
            ],
          };
        });
      },

      removeItem: (producto_id) =>
        set((state) => ({
          items: state.items.filter((i) => i.producto_id !== producto_id),
        })),

      setCantidad: (producto_id, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.producto_id === producto_id
              ? {
                  ...i,
                  cantidad: Math.max(1, Math.min(cantidad, i.stock)),
                }
              : i,
          ),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "food-store-cart" },
  ),
);

// Helpers de cálculo (no forman parte del estado para no persistirlos)
export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.precio_unitario * i.cantidad, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.cantidad, 0);
}