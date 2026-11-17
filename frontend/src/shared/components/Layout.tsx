import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { useCartStore, cartCount } from "@/features/cart/store";

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const count = cartCount(items);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-gray-900">
            🍔 Food Store
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Catálogo
            </Link>
            {user && (
              <Link
                to="/mis-pedidos"
                className="text-gray-700 hover:text-blue-600"
              >
                Mis pedidos
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="text-gray-700 hover:text-blue-600"
              >
                Admin
              </Link>
            )}
            <Link
              to="/carrito"
              className="relative rounded bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200"
            >
              🛒 Carrito
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {count}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{user.username}</span>
                <button
                  onClick={handleLogout}
                  className="rounded bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
              >
                Ingresar
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}