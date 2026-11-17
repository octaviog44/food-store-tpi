import { NavLink, Outlet } from "react-router-dom";

const TABS = [
  { to: "/admin", label: "Resumen", end: true },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/usuarios", label: "Usuarios" },
];

export function AdminLayout() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Panel de administración</h1>
      <nav className="mb-6 flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `rounded-t-md px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}