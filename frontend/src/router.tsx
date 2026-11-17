import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "@/features/auth/Login";
import { Register } from "@/features/auth/Register";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CatalogPage } from "@/features/catalog/CatalogPage";
import { CartPage } from "@/features/cart/CartPage";
import { CheckoutPage } from "@/features/cart/CheckoutPage";
import { MisPedidosPage } from "@/features/orders/MisPedidosPage";
import { AdminLayout } from "@/features/admin/AdminLayout";
import { DashboardPage } from "@/features/admin/DashboardPage";
import { PedidosAdminPage } from "@/features/admin/PedidosAdminPage";
import { CategoriasAdminPage } from "@/features/admin/categorias/CategoriasAdminPage";
import { ProductosAdminPage } from "@/features/admin/productos/ProductosAdminPage";
import { Layout } from "@/shared/components/Layout";

function Placeholder({ label }: { label: string }) {
  return <div className="text-gray-500">{label} (próximo paso)</div>;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    element: <Layout />,
    children: [
      { path: "/", element: <CatalogPage /> },
      { path: "/carrito", element: <CartPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/checkout", element: <CheckoutPage /> },
          { path: "/mis-pedidos", element: <MisPedidosPage /> },
        ],
      },
      {
        element: <ProtectedRoute role="admin" />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: "pedidos", element: <PedidosAdminPage /> },
              { path: "productos", element: <ProductosAdminPage /> },
              { path: "categorias", element: <CategoriasAdminPage /> },
              {
                path: "usuarios",
                element: <Placeholder label="Usuarios admin" />,
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);