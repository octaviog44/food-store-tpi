import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "@/features/auth/Login";
import { Register } from "@/features/auth/Register";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CatalogPage } from "@/features/catalog/CatalogPage";
import { CartPage } from "@/features/cart/CartPage";
import { CheckoutPage } from "@/features/cart/CheckoutPage";
import { MisPedidosPage } from "@/features/orders/MisPedidosPage";
import { Layout } from "@/shared/components/Layout";

function Admin() {
  return <div className="text-gray-500">Panel admin (próximo paso)</div>;
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
        children: [{ path: "/admin", element: <Admin /> }],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);