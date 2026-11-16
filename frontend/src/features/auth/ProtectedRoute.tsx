import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store";

interface Props {
  role?: "admin" | "user";
}

export function ProtectedRoute({ role }: Props) {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Cargando...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return <Outlet />;
}