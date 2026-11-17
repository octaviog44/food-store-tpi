import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { User } from "@/shared/types/api";
import { useAuthStore } from "@/features/auth/store";
import { activarUsuario, desactivarUsuario, fetchUsuarios } from "./api";

const columnHelper = createColumnHelper<User>();

export function UsuariosAdminPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: fetchUsuarios,
  });

  const activarMutation = useMutation({
    mutationFn: activarUsuario,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-usuarios"] }),
  });

  const desactivarMutation = useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-usuarios"] }),
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("username", { header: "Usuario" }),
      columnHelper.accessor("full_name", { header: "Nombre completo" }),
      columnHelper.accessor("email", { header: "Email" }),
      columnHelper.accessor("role", {
        header: "Rol",
        cell: (info) => (
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              info.getValue() === "admin"
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("disabled", {
        header: "Estado",
        cell: (info) => (
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              info.getValue()
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {info.getValue() ? "Desactivado" : "Activo"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const u = row.original;
          const esYo = currentUser?.id === u.id;
          if (u.disabled) {
            return (
              <button
                onClick={() => activarMutation.mutate(u.id)}
                className="text-sm text-green-600 hover:underline"
              >
                Activar
              </button>
            );
          }
          if (esYo) {
            return (
              <span className="text-xs text-gray-400">
                No podés desactivarte
              </span>
            );
          }
          return (
            <button
              onClick={() => {
                if (window.confirm(`¿Desactivar a "${u.username}"?`)) {
                  desactivarMutation.mutate(u.id);
                }
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Desactivar
            </button>
          );
        },
      }),
    ],
    [currentUser, activarMutation, desactivarMutation],
  );

  const table = useReactTable({
    data: usuarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p className="text-gray-500">Cargando usuarios...</p>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Usuarios</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-4 py-3 text-left font-medium text-gray-700"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}