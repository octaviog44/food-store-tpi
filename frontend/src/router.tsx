import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "@/features/auth/Login";
import { Register } from "@/features/auth/Register";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CatalogPage } from "@/features/catalog/CatalogPage";
import { Layout } from "@/shared/components/Layout";

function Carrito() {
  return <div className="text-gray-500">Carrito (próximo paso)</div>;
}
function MisPedidos() {
  return <div className="text-gray-500">Mis pedidos (próximo paso)</div>;
}
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
      { path: "/carrito", element: <Carrito /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "/mis-pedidos", element: <MisPedidos /> }],
      },
      {
        element: <ProtectedRoute role="admin" />,
        children: [{ path: "/admin", element: <Admin /> }],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);