import { NavLink, Outlet } from "react-router-dom";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/usuarios", label: "Usuarios" },
];

export function AdminLayout() {
  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <aside className="md:w-56 md:flex-shrink-0">
        <nav className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}