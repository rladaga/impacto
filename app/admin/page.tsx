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
import MultiSelect from "@/components/MultiSelect";
import imageCompression from "browser-image-compression";
import {
  ProfessionalsTab,
  OpportunitiesTab,
  VolunteersTab,
  MeetingsTab,
} from "./CommunitySections";

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
  activity_type?: string;
  modality?: string;
  accessibility?: string;
  age?: string;
  is_active?: boolean;
}

interface CategoryOption {
  id: string;
  category: string;
  value: string;
  is_active: boolean;
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

type TabType =
  | "contacts"
  | "projects"
  | "professionals"
  | "opportunities"
  | "volunteers"
  | "meetings"
  | "config";

function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("contacts");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
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
    activity_type: "",
    modality: "",
    accessibility: "",
    age: "",
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchContacts(),
      fetchProjects(),
      fetchCategoryOptions(),
    ]);
    setLoading(false);
  };

  const handleToggleProjectStatus = async (
    id: string,
    currentStatus: boolean,
  ) => {
    try {
      const response = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          is_active: !currentStatus,
        }),
      });

      if (response.ok) {
        await fetchProjects();
      }
    } catch (error) {
      console.error("Error toggling project status:", error);
    }
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

  const fetchCategoryOptions = async () => {
    const { data } = await supabase
      .from("config_options")
      .select("*")
      .order("value");
    if (data) {
      setCategoryOptions(data);
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

        if (response.ok) {
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

  const handleDeleteProject = async (project: Project) => {
    if (
      confirm(
        "¿Estás seguro de que quieres eliminar este proyecto y su imagen?",
      )
    ) {
      try {
        // 1. Delete image from Storage if it exists
        if (project.image_url) {
          await supabase.storage
            .from("project-images")
            .remove([project.image_url]);
        }

        // 2. Delete the database record
        const response = await fetch("/api/projects", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: project.id }),
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
      activity_type: project.activity_type || "",
      modality: project.modality || "",
      accessibility: project.accessibility || "",
      age: project.age || "",
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
      activity_type: "",
      modality: "",
      accessibility: "",
      age: "",
    });
    setEditingProject(null);
  };

  const getUniqueValues = (columnKey: keyof Contact) => {
    return Array.from(new Set(contacts.map((c) => c[columnKey])))
      .filter((v) => v !== null && v !== "")
      .sort() as string[];
  };

  const getOptions = (category: string) => {
    return categoryOptions
      .filter((o) => o.category === category && o.is_active)
      .map((o) => o.value);
  };

  const handleToggleOption = async (id: string, currentStatus: boolean) => {
    await supabase
      .from("config_options")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    fetchCategoryOptions();
  };

  const handleAddOption = async (category: string, value: string) => {
    await supabase
      .from("config_options")
      .insert({ category, value, is_active: true });
    fetchCategoryOptions();
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
    [],
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
      { accessorKey: "age", header: "Edad" },
      { accessorKey: "activity_type", header: "Tipo de Actividad" },
      { accessorKey: "modality", header: "Modalidad" },
      { accessorKey: "accessibility", header: "Accesibilidad" },
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
      {
        accessorKey: "image_url",
        header: "Imagen Path",
      },
      {
        accessorKey: "is_active",
        header: "Estado",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold ${
              row.original.is_active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {row.original.is_active ? "Activo" : "Inactivo"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() =>
                handleToggleProjectStatus(
                  row.original.id,
                  !!row.original.is_active,
                )
              }
              className={`px-3 py-1 rounded text-white transition text-sm font-medium cursor-pointer ${
                row.original.is_active
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {row.original.is_active ? "Desactivar" : "Activar"}
            </button>
            <button
              onClick={() => handleEditProject(row.original)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium cursor-pointer"
            >
              Editar
            </button>
            <button
              onClick={() => handleDeleteProject(row.original)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium cursor-pointer"
            >
              Eliminar
            </button>
          </div>
        ),
      },
    ],
    [projects],
  );

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const globalMatch =
        filtering === "" ||
        Object.values(contact).some((value) =>
          String(value).toLowerCase().includes(filtering.toLowerCase()),
        );

      const columnMatch = Object.entries(columnFilters).every(
        ([key, value]) => {
          if (!value) return true;
          return String(contact[key as keyof Contact])
            .toLowerCase()
            .includes(String(value).toLowerCase());
        },
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
          <div className="flex flex-wrap border-b border-gray-200">
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
            <button
              onClick={() => setActiveTab("professionals")}
              className={`flex-1 px-6 py-4 font-medium text-center transition ${
                activeTab === "professionals"
                  ? "bg-secondary text-white"
                  : "bg-gray-50 text-dark hover:bg-gray-100"
              }`}
            >
              Profesionales
            </button>
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`flex-1 px-6 py-4 font-medium text-center transition ${
                activeTab === "opportunities"
                  ? "bg-secondary text-white"
                  : "bg-gray-50 text-dark hover:bg-gray-100"
              }`}
            >
              Oportunidades
            </button>
            <button
              onClick={() => setActiveTab("volunteers")}
              className={`flex-1 px-6 py-4 font-medium text-center transition ${
                activeTab === "volunteers"
                  ? "bg-secondary text-white"
                  : "bg-gray-50 text-dark hover:bg-gray-100"
              }`}
            >
              Voluntarios
            </button>
            <button
              onClick={() => setActiveTab("meetings")}
              className={`flex-1 px-6 py-4 font-medium text-center transition ${
                activeTab === "meetings"
                  ? "bg-secondary text-white"
                  : "bg-gray-50 text-dark hover:bg-gray-100"
              }`}
            >
              Encuentros
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`flex-1 px-6 py-4 font-medium text-center transition ${
                activeTab === "config"
                  ? "bg-secondary text-white"
                  : "bg-gray-50 text-dark hover:bg-gray-100"
              }`}
            >
              Configuración
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

          {activeTab === "professionals" && (
            <motion.div
              key="professionals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProfessionalsTab />
            </motion.div>
          )}

          {activeTab === "opportunities" && (
            <motion.div
              key="opportunities"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OpportunitiesTab />
            </motion.div>
          )}

          {activeTab === "volunteers" && (
            <motion.div
              key="volunteers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <VolunteersTab />
            </motion.div>
          )}

          {activeTab === "meetings" && (
            <motion.div
              key="meetings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MeetingsTab />
            </motion.div>
          )}

          {activeTab === "config" && (
            <motion.div
              key="config"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ConfigTab
                categoryOptions={categoryOptions}
                onToggle={handleToggleOption}
                onAdd={handleAddOption}
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
            getOptions={getOptions}
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
                            header.getContext(),
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
                          cell.getContext(),
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
                          header.getContext(),
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
                          cell.getContext(),
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

interface ConfigTabProps {
  categoryOptions: CategoryOption[];
  onToggle: (id: string, currentStatus: boolean) => void;
  onAdd: (category: string, value: string) => void;
}

function ConfigTab({ categoryOptions, onToggle, onAdd }: ConfigTabProps) {
  const [newValues, setNewValues] = useState<Record<string, string>>({});

  const CATEGORIES = [
    { id: "disability_type", label: "Tipo de Discapacidad" },
    { id: "age", label: "Edad" },
    { id: "activity_type", label: "Tipo de Actividad" },
    { id: "modality", label: "Modalidad" },
    { id: "accessibility", label: "Accesibilidad" },
  ];

  const handleAdd = (categoryId: string) => {
    if (newValues[categoryId]?.trim()) {
      onAdd(categoryId, newValues[categoryId].trim());
      setNewValues({ ...newValues, [categoryId]: "" });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-dark mb-6">
        Configuración de Filtros de Búsqueda
      </h2>
      <div className="space-y-8">
        {CATEGORIES.map((cat) => {
          const options = categoryOptions.filter((o) => o.category === cat.id);
          return (
            <div key={cat.id} className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-secondary mb-4 uppercase">
                {cat.label}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded border border-gray-100"
                  >
                    <span
                      className={`text-sm ${
                        opt.is_active
                          ? "text-dark font-medium"
                          : "text-gray-400 line-through"
                      }`}
                    >
                      {opt.value}
                    </span>
                    <button
                      onClick={() => onToggle(opt.id, opt.is_active)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                        opt.is_active
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {opt.is_active ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Nueva opción..."
                  value={newValues[cat.id] || ""}
                  onChange={(e) =>
                    setNewValues({ ...newValues, [cat.id]: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleAdd(cat.id)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-secondary text-sm text-dark outline-none"
                />
                <button
                  onClick={() => handleAdd(cat.id)}
                  className="px-4 py-2 bg-secondary text-white rounded hover:bg-primary transition text-sm font-medium cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </div>
          );
        })}
      </div>
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
  getOptions: (category: string) => string[];
}

function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEditing,
  getOptions,
}: ProjectModalProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const getSelected = (val: string | undefined) => {
    return val
      ? val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  };

  const handleMultiSelectChange = (
    key: keyof Omit<Project, "id">,
    selected: string[],
  ) => {
    setFormData({ ...formData, [key]: selected.join(", ") });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      if (!formData.name) {
        alert(
          "Por favor, ingresa el nombre del proyecto antes de subir una imagen.",
        );
        return;
      }

      const file = e.target.files[0];
      const options = {
        maxSizeMB: 1, // Max file size 1MB (Great balance of quality/speed)
        maxWidthOrHeight: 1920, // Max width/height 1920px
        useWebWorker: true, // Better performance
        fileType: "image/jpeg", // Convert to jpeg for consistent compression
      };

      console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      const compressedFile = await imageCompression(file, options);
      console.log(
        `Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
      );

      const fileExt = "jpg"; // We forced it to jpeg in options
      const fileName = `${formData.name.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // 1. Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      // 2. If there was a previous image, delete it
      if (formData.image_url) {
        await supabase.storage
          .from("project-images")
          .remove([formData.image_url]);
      }

      // 3. Update form
      setFormData({ ...formData, image_url: filePath });
    } catch (error: any) {
      alert("Error subiendo imagen: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.image_url) return;

    try {
      setUploading(true);
      const { error } = await supabase.storage
        .from("project-images")
        .remove([formData.image_url]);

      if (error) throw error;
      setFormData({ ...formData, image_url: "" });
    } catch (error: any) {
      alert("Error eliminando imagen: " + error.message);
    } finally {
      setUploading(false);
    }
  };

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

          {/* IMAGE UPLOAD SECTION */}
          <div className="border-b pb-4 mb-4">
            <label className="block text-sm font-medium text-dark mb-2">
              Imagen del Proyecto
            </label>
            {formData.image_url ? (
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden group">
                <img
                  src={
                    supabase.storage
                      .from("project-images")
                      .getPublicUrl(formData.image_url).data.publicUrl
                  }
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition shadow-md opacity-0 group-hover:opacity-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 truncate">
                  {formData.image_url}
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-2 text-sm text-gray-500">
                    {uploading ? "Subiendo..." : "Click para subir imagen"}
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            )}
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

          <MultiSelect
            label="Tipo de Discapacidad *"
            options={getOptions("disability_type")}
            selected={getSelected(formData.disability_type)}
            onChange={(selected) =>
              handleMultiSelectChange("disability_type", selected)
            }
          />

          <MultiSelect
            label="Edad *"
            options={getOptions("age")}
            selected={getSelected(formData.age)}
            onChange={(selected) => handleMultiSelectChange("age", selected)}
          />

          <MultiSelect
            label="Tipo de Actividad"
            options={getOptions("activity_type")}
            selected={getSelected(formData.activity_type)}
            onChange={(selected) =>
              handleMultiSelectChange("activity_type", selected)
            }
          />

          <MultiSelect
            label="Modalidad"
            options={getOptions("modality")}
            selected={getSelected(formData.modality)}
            onChange={(selected) =>
              handleMultiSelectChange("modality", selected)
            }
          />

          <MultiSelect
            label="Accesibilidad"
            options={getOptions("accessibility")}
            selected={getSelected(formData.accessibility)}
            onChange={(selected) =>
              handleMultiSelectChange("accessibility", selected)
            }
          />

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

          <div className="grid grid-cols-2 gap-4">
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
              disabled={uploading}
              className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition font-medium cursor-pointer disabled:opacity-50"
            >
              {isEditing ? "Guardar Cambios" : "Crear Proyecto"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
