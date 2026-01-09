"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "motion/react";
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

interface Project {
  id: string;
  name: string;
  audience: string;
  disability_type: string;
  description: string;
  address: string;
  services: string;
  contact: string;
  created_at?: string;
  lng?: string;
  lat?: string;
  image_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  email?: string;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

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

type TabType = "contacts" | "projects";

function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("contacts");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<any>([]);
  const [filtering, setFiltering] = useState("");
  const [columnFilters, setColumnFilters] = useState<any>({});
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectFormData, setProjectFormData] = useState<Omit<Project, "id">>({
    name: "",
    audience: "",
    disability_type: "",
    description: "",
    address: "",
    contact: "",
    lng: "",
    lat: "",
    image_url: "",
    services: "",
    facebook_url: "",
    instagram_url: "",
    email: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchContacts(), fetchProjects()]);
    setLoading(false);
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contact");

      if (response.ok) {
        const data = await response.json();
        setContacts(data || []);
      } else {
        console.error("Error fetching contacts:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProject) {
        const response = await fetch("/api/projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProject.id,
            ...projectFormData,
          }),
        });

        console.log(projectFormData);

        if (response.ok) {
          console.log(response);

          setShowProjectModal(false);
          setEditingProject(null);
          resetProjectForm();
          await fetchProjects();
        }
      } else {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectFormData),
        });

        if (response.ok) {
          setShowProjectModal(false);
          resetProjectForm();
          await fetchProjects();
        }
      }
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este proyecto?")) {
      try {
        const response = await fetch("/api/projects", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          await fetchProjects();
        }
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectFormData({
      name: project.name,
      audience: project.audience,
      disability_type: project.disability_type,
      description: project.description,
      address: project.address,
      contact: project.contact,
      lng: project.lng || "",
      lat: project.lat || "",
      services: project.services || "",
      facebook_url: project.facebook_url || "",
      instagram_url: project.instagram_url || "",
      image_url: project.image_url || "",
      email: project.email || "",
    });
    setShowProjectModal(true);
  };

  const resetProjectForm = () => {
    setProjectFormData({
      name: "",
      audience: "",
      disability_type: "",
      description: "",
      address: "",
      contact: "",
      lng: "",
      lat: "",
      services: "",
      facebook_url: "",
      instagram_url: "",
      image_url: "",
      email: "",
    });
    setEditingProject(null);
  };

  const getUniqueValues = (columnKey: keyof Contact) => {
    return Array.from(new Set(contacts.map((c) => c[columnKey])))
      .filter((v) => v !== null && v !== "")
      .sort() as string[];
  };

  const contactColumns = useMemo<ColumnDef<Contact>[]>(
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

  const projectColumns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nombre",
      },
      {
        accessorKey: "audience",
        header: "Público Objetivo",
      },
      {
        accessorKey: "disability_type",
        header: "Tipo de Discapacidad",
      },
      {
        accessorKey: "address",
        header: "Dirección",
      },
      {
        accessorKey: "contact",
        header: "Página web",
      },
      { accessorKey: "lng", header: "Longitud" },
      { accessorKey: "lat", header: "Latitud" },
      { accessorKey: "services", header: "Servicios" },
      { accessorKey: "facebook_url", header: "Facebook" },
      { accessorKey: "instagram_url", header: "Instagram" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "image_url", header: "Imagen" },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEditProject(row.original)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium cursor-pointer"
            >
              Editar
            </button>
            <button
              onClick={() => handleDeleteProject(row.original.id)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium cursor-pointer"
            >
              Eliminar
            </button>
          </div>
        ),
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

  const contactTable = useReactTable({
    data: filteredContacts,
    columns: contactColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  const projectTable = useReactTable({
    data: projects,
    columns: projectColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="min-h-screen font-alte-bold bg-linear-to-b from-light to-secondary p-8">
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

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab("contacts");
                setFiltering("");
                setColumnFilters({});
              }}
              className={`flex-1 px-6 py-4 font-medium text-center transition ${
                activeTab === "contacts"
                  ? "bg-secondary text-white"
                  : "bg-gray-50 text-dark hover:bg-gray-100"
              }`}
            >
              Contactos ({contacts.length})
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex-1 px-6 py-4 font-medium text-center transition ${
                activeTab === "projects"
                  ? "bg-secondary text-white"
                  : "bg-gray-50 text-dark hover:bg-gray-100"
              }`}
            >
              Proyectos ({projects.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "contacts" && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ContactsTable
                contacts={contacts}
                filtering={filtering}
                setFiltering={setFiltering}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
                table={contactTable}
                getUniqueValues={getUniqueValues}
                loading={loading}
              />
            </motion.div>
          )}

          {activeTab === "projects" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectsTable
                projects={projects}
                table={projectTable}
                loading={loading}
                onAddProject={() => {
                  resetProjectForm();
                  setShowProjectModal(true);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Project Modal */}
      <AnimatePresence>
        {showProjectModal && (
          <ProjectModal
            isOpen={showProjectModal}
            onClose={() => {
              setShowProjectModal(false);
              resetProjectForm();
            }}
            onSubmit={handleSaveProject}
            formData={projectFormData}
            setFormData={setProjectFormData}
            isEditing={!!editingProject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface ContactsTableProps {
  contacts: Contact[];
  filtering: string;
  setFiltering: (value: string) => void;
  columnFilters: any;
  setColumnFilters: (value: any) => void;
  table: ReturnType<typeof useReactTable<Contact>>;
  getUniqueValues: (key: keyof Contact) => string[];
  loading: boolean;
}

function ContactsTable({
  contacts,
  filtering,
  setFiltering,
  columnFilters,
  setColumnFilters,
  table,
  getUniqueValues,
  loading,
}: ContactsTableProps) {
  return (
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

      <div className="mb-6 flex gap-4 items-end flex-wrap">
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
          className="px-3 py-2 bg-secondary text-white rounded-lg hover:bg-primary hover:text-secondary transition font-medium cursor-pointer"
        >
          Limpiar filtros
        </button>
      </div>

      {loading ? (
        <p className="text-center text-dark">Cargando...</p>
      ) : contacts.length === 0 ? (
        <p className="text-center text-dark">No hay contactos</p>
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
                      <td key={cell.id} className="px-6 py-4 text-dark text-sm">
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
  );
}

interface ProjectsTableProps {
  projects: Project[];
  table: ReturnType<typeof useReactTable<Project>>;
  loading: boolean;
  onAddProject: () => void;
}

function ProjectsTable({
  projects,
  table,
  loading,
  onAddProject,
}: ProjectsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark">
          Proyectos ({projects.length})
        </h2>
        <button
          onClick={onAddProject}
          className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition font-medium cursor-pointer"
        >
          + Agregar Proyecto
        </button>
      </div>

      {loading ? (
        <p className="text-center text-dark">Cargando...</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-dark">No hay proyectos</p>
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
                        className="px-6 py-3 text-left text-dark font-bold text-sm uppercase border-b border-gray-200"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                      <td key={cell.id} className="px-6 py-4 text-dark text-sm">
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
  );
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: Omit<Project, "id">;
  setFormData: (data: Omit<Project, "id">) => void;
  isEditing: boolean;
}

function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEditing,
}: ProjectModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-secondary mb-6">
          {isEditing ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark resize-none"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Publico objetivo *
            </label>
            <input
              type="text"
              value={formData.audience}
              onChange={(e) =>
                setFormData({ ...formData, audience: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Servicios
            </label>
            <input
              type="text"
              value={formData.services}
              onChange={(e) =>
                setFormData({ ...formData, services: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Tipo de Discapacidad *
            </label>
            <input
              type="text"
              value={formData.disability_type}
              onChange={(e) =>
                setFormData({ ...formData, disability_type: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Dirección *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Página web *
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Email *
            </label>
            <input
              type="text"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Imagen URL *
            </label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Facebook URL
            </label>
            <input
              type="text"
              value={formData.facebook_url}
              onChange={(e) =>
                setFormData({ ...formData, facebook_url: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Instagram URL
            </label>
            <input
              type="text"
              value={formData.instagram_url}
              onChange={(e) =>
                setFormData({ ...formData, instagram_url: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Longitud
            </label>
            <input
              type="text"
              value={formData.lng}
              onChange={(e) =>
                setFormData({ ...formData, lng: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Latitud
            </label>
            <input
              type="text"
              value={formData.lat}
              onChange={(e) =>
                setFormData({ ...formData, lat: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark"
            />
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-dark rounded-lg hover:bg-gray-50 transition font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition font-medium cursor-pointer"
            >
              {isEditing ? "Guardar Cambios" : "Crear Proyecto"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
