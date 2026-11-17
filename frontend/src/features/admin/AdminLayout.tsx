import { Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Panel de administración</h1>
      <Outlet />
    </div>
  );
}
