"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

interface Contact {
  id: string;
  name: string;
  email: string;
  location: string;
  interested_in: string;
  message: string;
  created_at: string;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setIsLoggedIn(true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setIsLoggedIn(true);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
  };

  if (isLoggedIn) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-light to-secondary flex items-center justify-center px-4">
      <motion.div
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-secondary mb-6 text-center">
          Admin
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-dark font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
              required
            />
          </div>

          <div>
            <label className="block text-dark font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white font-medium py-2 rounded-lg hover:bg-primary disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? "Cargando..." : "Entrar"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

interface AdminDashboardProps {
  onLogout: () => void;
}

function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<any>([]);
  const [filtering, setFiltering] = useState("");
  const [columnFilters, setColumnFilters] = useState<any>({});

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching contacts:", error);
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  };

  const getUniqueValues = (columnKey: keyof Contact) => {
    return Array.from(new Set(contacts.map((c) => c[columnKey])))
      .filter((v) => v !== null && v !== "")
      .sort() as string[];
  };

  const columns = useMemo<ColumnDef<Contact>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "location",
        header: "Ubicación",
      },
      {
        accessorKey: "interested_in",
        header: "Participación",
      },
      {
        accessorKey: "message",
        header: "Mensaje",
      },
      {
        accessorKey: "created_at",
        header: "Fecha",
        cell: (info) =>
          new Date(info.getValue() as string).toLocaleDateString("es-ES"),
      },
    ],
    []
  );

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const globalMatch =
        filtering === "" ||
        Object.values(contact).some((value) =>
          String(value).toLowerCase().includes(filtering.toLowerCase())
        );

      const columnMatch = Object.entries(columnFilters).every(
        ([key, value]) => {
          if (!value) return true;
          return String(contact[key as keyof Contact])
            .toLowerCase()
            .includes(String(value).toLowerCase());
        }
      );

      return globalMatch && columnMatch;
    });
  }, [contacts, filtering, columnFilters]);

  const table = useReactTable({
    data: filteredContacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-light to-secondary p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-secondary">Dashboard</h1>
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-dark">
              Contactos ({contacts.length})
            </h2>
            <input
              type="text"
              placeholder="Buscar..."
              value={filtering}
              onChange={(e) => setFiltering(e.target.value)}
              className="px-4 py-2 border text-dark border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div className="mb-6 flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Filtro Participación
              </label>
              <select
                value={columnFilters.interested_in || ""}
                onChange={(e) =>
                  setColumnFilters({
                    ...columnFilters,
                    interested_in: e.target.value,
                  })
                }
                className="w-50 px-3 py-2 border text-dark border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">Todos</option>
                {getUniqueValues("interested_in").map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Filtro Ubicación
              </label>
              <select
                value={columnFilters.location || ""}
                onChange={(e) =>
                  setColumnFilters({
                    ...columnFilters,
                    location: e.target.value,
                  })
                }
                className="w-50 px-3 py-2 border text-dark border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">Todos</option>
                {getUniqueValues("location").map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setColumnFilters({})}
              className="w-50 px-3 py-2 bg-secondary text-white rounded-lg hover:bg-light hover:text-secondary transition font-medium cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>

          {loading ? (
            <p className="text-center text-dark">Cargando...</p>
          ) : filteredContacts.length === 0 ? (
            <p className="text-center text-dark">
              No hay contactos con estos filtros
            </p>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-secondary/10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            onClick={header.column.getToggleSortingHandler()}
                            className="px-6 py-3 text-left text-dark font-bold text-sm uppercase border-b border-gray-200 cursor-pointer hover:bg-secondary/20"
                          >
                            <div className="flex items-center gap-2">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getIsSorted() && (
                                <span className="text-secondary">
                                  {header.column.getIsSorted() === "asc"
                                    ? "↑"
                                    : "↓"}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`border-b border-gray-200 hover:bg-light/50 transition ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 text-dark text-sm"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="flex gap-2">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Siguiente →
                  </button>
                </div>
                <span className="text-dark text-sm font-medium">
                  Página {table.getState().pagination.pageIndex + 1} de{" "}
                  {table.getPageCount()}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
