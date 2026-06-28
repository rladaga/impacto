"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { createClient } from "@/utils/supabase/client";
import imageCompression from "browser-image-compression";

/* ===========================================================================
   Admin tabs for the Profesionales / Voluntariado sections.
   Each component is self-contained: it fetches its own data from the API
   routes (which enforce auth) and manages its own modals. This keeps the main
   admin dashboard file small — it only renders these and switches tabs.
   ========================================================================= */

const BUCKET = "project-images"; // reuse the existing public bucket

async function uploadImage(file: File, prefix: string): Promise<string> {
  const supabase = createClient();
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/jpeg",
  });
  const fileName = `${prefix}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, compressed);
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl;
}

const inputCls =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-dark";
const labelCls = "block text-sm font-medium text-dark mb-1";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function fmtDate(d?: string) {
  return d ? new Date(d).toLocaleDateString("es-ES") : "—";
}

/* ===========================  PROFESIONALES  ============================== */

interface Professional {
  id: string;
  name: string;
  photo?: string;
  specialty?: string;
  description_short?: string;
  description_long?: string;
  credentials?: string;
  experience_years?: number | string;
  disabilities?: string[];
  ages?: string[];
  modality?: string;
  location?: string;
  price?: number | string;
  calendly_url?: string;
  verified?: boolean;
  active?: boolean;
  created_at?: string;
}

const emptyPro: Professional = {
  id: "",
  name: "",
  photo: "",
  specialty: "",
  description_short: "",
  description_long: "",
  credentials: "",
  experience_years: "",
  disabilities: [],
  ages: [],
  modality: "",
  location: "",
  price: "",
  calendly_url: "",
  verified: false,
  active: true,
};

export function ProfessionalsTab() {
  const [rows, setRows] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Professional | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/professionals");
    if (res.ok) setRows(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (p: Professional) => {
    await fetch("/api/professionals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    load();
  };

  const remove = async (p: Professional) => {
    if (!confirm(`¿Eliminar a ${p.name}?`)) return;
    await fetch("/api/professionals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });
    load();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark">
          Profesionales ({rows.length})
        </h2>
        <button
          onClick={() => setEditing({ ...emptyPro })}
          className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition font-medium cursor-pointer"
        >
          + Agregar Profesional
        </button>
      </div>

      {loading ? (
        <p className="text-center text-dark">Cargando...</p>
      ) : rows.length === 0 ? (
        <p className="text-center text-dark">No hay profesionales</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-secondary/10">
              <tr>
                {[
                  "Nombre",
                  "Especialidad",
                  "Ubicación",
                  "Modalidad",
                  "Precio",
                  "Calendly",
                  "Estado",
                  "Acciones",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-dark font-bold text-sm uppercase border-b border-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-gray-200 ${i % 2 ? "bg-gray-50" : "bg-white"}`}
                >
                  <td className="px-4 py-3 text-dark text-sm">{p.name}</td>
                  <td className="px-4 py-3 text-dark text-sm">{p.specialty}</td>
                  <td className="px-4 py-3 text-dark text-sm">{p.location}</td>
                  <td className="px-4 py-3 text-dark text-sm">{p.modality}</td>
                  <td className="px-4 py-3 text-dark text-sm">
                    {p.price ? `€${p.price}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-dark text-sm">
                    {p.calendly_url ? "✓" : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`px-3 py-1 rounded text-white text-sm font-medium cursor-pointer ${p.active ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"}`}
                      >
                        {p.active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => setEditing(p)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProfessionalModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ProfessionalModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Professional;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = !!initial.id;
  const [form, setForm] = useState<Professional>({
    ...initial,
    disabilities: initial.disabilities ?? [],
    ages: initial.ages ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k: keyof Professional, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      setUploading(true);
      const url = await uploadImage(e.target.files[0], "professionals");
      set("photo", url);
    } catch (err) {
      alert("Error subiendo imagen: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      experience_years: form.experience_years
        ? Number(form.experience_years)
        : null,
      price: form.price ? Number(form.price) : null,
    };
    const res = await fetch("/api/professionals", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else alert("Error al guardar");
  };

  const csv = (arr?: string[]) => (arr ?? []).join(", ");
  const toArr = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  return (
    <ModalShell title={isEditing ? "Editar Profesional" : "Nuevo Profesional"} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <Field label="Nombre *">
          <input
            className={inputCls}
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>

        <Field label="Foto">
          {form.photo ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.photo}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
              />
              <button
                type="button"
                onClick={() => set("photo", "")}
                className="text-red-600 text-sm underline"
              >
                Quitar
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="text-sm text-dark"
            />
          )}
          {uploading && <p className="text-xs text-gray-500">Subiendo...</p>}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Especialidad">
            <input
              className={inputCls}
              value={form.specialty ?? ""}
              onChange={(e) => set("specialty", e.target.value)}
            />
          </Field>
          <Field label="Ubicación">
            <input
              className={inputCls}
              value={form.location ?? ""}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Modalidad">
            <input
              className={inputCls}
              value={form.modality ?? ""}
              onChange={(e) => set("modality", e.target.value)}
            />
          </Field>
          <Field label="Precio (€)">
            <input
              type="number"
              className={inputCls}
              value={form.price ?? ""}
              onChange={(e) => set("price", e.target.value)}
            />
          </Field>
          <Field label="Años de experiencia">
            <input
              type="number"
              className={inputCls}
              value={form.experience_years ?? ""}
              onChange={(e) => set("experience_years", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Discapacidades / tags (separados por coma)">
          <input
            className={inputCls}
            value={csv(form.disabilities)}
            onChange={(e) => set("disabilities", toArr(e.target.value))}
          />
        </Field>
        <Field label="Edades (separadas por coma)">
          <input
            className={inputCls}
            value={csv(form.ages)}
            onChange={(e) => set("ages", toArr(e.target.value))}
          />
        </Field>

        <Field label="Credenciales">
          <input
            className={inputCls}
            value={form.credentials ?? ""}
            onChange={(e) => set("credentials", e.target.value)}
          />
        </Field>

        <Field label="Descripción corta (tarjeta)">
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            value={form.description_short ?? ""}
            onChange={(e) => set("description_short", e.target.value)}
          />
        </Field>
        <Field label="Descripción larga (ficha)">
          <textarea
            className={`${inputCls} resize-none`}
            rows={4}
            value={form.description_long ?? ""}
            onChange={(e) => set("description_long", e.target.value)}
          />
        </Field>

        <Field label="Calendly URL (embed del encuentro gratuito)">
          <input
            className={inputCls}
            placeholder="https://calendly.com/.../impacto-30min"
            value={form.calendly_url ?? ""}
            onChange={(e) => set("calendly_url", e.target.value)}
          />
        </Field>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-dark text-sm">
            <input
              type="checkbox"
              checked={!!form.verified}
              onChange={(e) => set("verified", e.target.checked)}
            />
            Verificado
          </label>
          <label className="flex items-center gap-2 text-dark text-sm">
            <input
              type="checkbox"
              checked={!!form.active}
              onChange={(e) => set("active", e.target.checked)}
            />
            Activo
          </label>
        </div>

        <ModalActions onClose={onClose} saving={saving || uploading} isEditing={isEditing} />
      </form>
    </ModalShell>
  );
}

/* ===========================  OPORTUNIDADES  ============================== */

interface Opportunity {
  id: string;
  title: string;
  entity?: string;
  entity_email?: string;
  area?: string;
  about_project?: string;
  role?: string;
  image_url?: string;
  location?: string;
  hours?: string;
  start_date?: string;
  is_active?: boolean;
}

const emptyOpp: Opportunity = {
  id: "",
  title: "",
  entity: "",
  entity_email: "",
  area: "",
  about_project: "",
  role: "",
  image_url: "",
  location: "",
  hours: "",
  start_date: "",
  is_active: true,
};

export function OpportunitiesTab() {
  const [rows, setRows] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Opportunity | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/opportunities");
    if (res.ok) setRows(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const toggle = async (o: Opportunity) => {
    await fetch("/api/opportunities", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: o.id, is_active: !o.is_active }),
    });
    load();
  };

  const remove = async (o: Opportunity) => {
    if (!confirm(`¿Eliminar "${o.title}"?`)) return;
    await fetch("/api/opportunities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: o.id }),
    });
    load();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark">
          Oportunidades ({rows.length})
        </h2>
        <button
          onClick={() => setEditing({ ...emptyOpp })}
          className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition font-medium cursor-pointer"
        >
          + Agregar Oportunidad
        </button>
      </div>

      {loading ? (
        <p className="text-center text-dark">Cargando...</p>
      ) : rows.length === 0 ? (
        <p className="text-center text-dark">No hay oportunidades</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-secondary/10">
              <tr>
                {[
                  "Título",
                  "Entidad",
                  "Email entidad",
                  "Área",
                  "Ubicación",
                  "Estado",
                  "Acciones",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-dark font-bold text-sm uppercase border-b border-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((o, i) => (
                <tr
                  key={o.id}
                  className={`border-b border-gray-200 ${i % 2 ? "bg-gray-50" : "bg-white"}`}
                >
                  <td className="px-4 py-3 text-dark text-sm">{o.title}</td>
                  <td className="px-4 py-3 text-dark text-sm">{o.entity}</td>
                  <td className="px-4 py-3 text-dark text-sm">
                    {o.entity_email || "—"}
                  </td>
                  <td className="px-4 py-3 text-dark text-sm">{o.area}</td>
                  <td className="px-4 py-3 text-dark text-sm">{o.location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${o.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {o.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggle(o)}
                        className={`px-3 py-1 rounded text-white text-sm font-medium cursor-pointer ${o.is_active ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"}`}
                      >
                        {o.is_active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => setEditing(o)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => remove(o)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <OpportunityModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function OpportunityModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Opportunity;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = !!initial.id;
  const [form, setForm] = useState<Opportunity>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k: keyof Opportunity, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      setUploading(true);
      const url = await uploadImage(e.target.files[0], "opportunities");
      set("image_url", url);
    } catch (err) {
      alert("Error subiendo imagen: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/opportunities", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else alert("Error al guardar");
  };

  return (
    <ModalShell title={isEditing ? "Editar Oportunidad" : "Nueva Oportunidad"} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <Field label="Título *">
          <input
            className={inputCls}
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>

        <Field label="Imagen">
          {form.image_url ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.image_url}
                alt=""
                className="w-24 h-16 rounded object-cover"
              />
              <button
                type="button"
                onClick={() => set("image_url", "")}
                className="text-red-600 text-sm underline"
              >
                Quitar
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="text-sm text-dark"
            />
          )}
          {uploading && <p className="text-xs text-gray-500">Subiendo...</p>}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Entidad">
            <input
              className={inputCls}
              value={form.entity ?? ""}
              onChange={(e) => set("entity", e.target.value)}
            />
          </Field>
          <Field label="Email de la entidad (recibe postulaciones)">
            <input
              type="email"
              className={inputCls}
              value={form.entity_email ?? ""}
              onChange={(e) => set("entity_email", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Área">
            <input
              className={inputCls}
              value={form.area ?? ""}
              onChange={(e) => set("area", e.target.value)}
            />
          </Field>
          <Field label="Ubicación">
            <input
              className={inputCls}
              value={form.location ?? ""}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Horas (ej: 4 horas semanales)">
            <input
              className={inputCls}
              value={form.hours ?? ""}
              onChange={(e) => set("hours", e.target.value)}
            />
          </Field>
          <Field label="Inicio (ej: Desde Marzo 2026)">
            <input
              className={inputCls}
              value={form.start_date ?? ""}
              onChange={(e) => set("start_date", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Sobre el proyecto">
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            value={form.about_project ?? ""}
            onChange={(e) => set("about_project", e.target.value)}
          />
        </Field>
        <Field label="El rol">
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            value={form.role ?? ""}
            onChange={(e) => set("role", e.target.value)}
          />
        </Field>

        <label className="flex items-center gap-2 text-dark text-sm">
          <input
            type="checkbox"
            checked={!!form.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
          />
          Activa
        </label>

        <ModalActions onClose={onClose} saving={saving || uploading} isEditing={isEditing} />
      </form>
    </ModalShell>
  );
}

/* ============================  VOLUNTARIOS  ============================== */

interface Volunteer {
  id: string;
  name: string;
  email: string;
  city?: string;
  availability?: string;
  modality?: string;
  interests?: string;
  experience?: string;
  motivation?: string;
  mode?: string;
  created_at?: string;
  opportunity?: { title?: string; entity?: string } | null;
}

export function VolunteersTab() {
  const [rows, setRows] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/volunteers");
    if (res.ok) setRows(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (v: Volunteer) => {
    if (!confirm(`¿Eliminar a ${v.name}?`)) return;
    await fetch("/api/volunteers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: v.id }),
    });
    load();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-dark mb-6">
        Voluntarios ({rows.length})
      </h2>
      {loading ? (
        <p className="text-center text-dark">Cargando...</p>
      ) : rows.length === 0 ? (
        <p className="text-center text-dark">No hay voluntarios</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-secondary/10">
              <tr>
                {[
                  "Nombre",
                  "Email",
                  "Ciudad",
                  "Tipo",
                  "Oportunidad",
                  "Disponibilidad",
                  "Modalidad",
                  "Intereses",
                  "Fecha",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-dark font-bold text-xs uppercase border-b border-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((v, i) => (
                <tr
                  key={v.id}
                  className={`border-b border-gray-200 ${i % 2 ? "bg-gray-50" : "bg-white"}`}
                >
                  <td className="px-4 py-3 text-dark text-sm">{v.name}</td>
                  <td className="px-4 py-3 text-dark text-sm">{v.email}</td>
                  <td className="px-4 py-3 text-dark text-sm">{v.city}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${v.mode === "postulation" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {v.mode === "postulation" ? "Postulación" : "Perfil"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-dark text-sm">
                    {v.opportunity?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-dark text-sm">
                    {v.availability}
                  </td>
                  <td className="px-4 py-3 text-dark text-sm">{v.modality}</td>
                  <td className="px-4 py-3 text-dark text-sm">{v.interests}</td>
                  <td className="px-4 py-3 text-dark text-sm">
                    {fmtDate(v.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => remove(v)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* =====================  ENCUENTROS (free_meetings)  ===================== */

interface Meeting {
  id: string;
  name: string;
  email: string;
  message?: string;
  created_at?: string;
  professional?: { name?: string; specialty?: string } | null;
}

export function MeetingsTab() {
  const [rows, setRows] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/free-meetings");
    if (res.ok) setRows(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (m: Meeting) => {
    if (!confirm(`¿Eliminar solicitud de ${m.name}?`)) return;
    await fetch("/api/free-meetings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id }),
    });
    load();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-dark mb-6">
        Encuentros gratuitos ({rows.length})
      </h2>
      {loading ? (
        <p className="text-center text-dark">Cargando...</p>
      ) : rows.length === 0 ? (
        <p className="text-center text-dark">No hay solicitudes</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-secondary/10">
              <tr>
                {["Nombre", "Email", "Profesional", "Mensaje", "Fecha", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-dark font-bold text-sm uppercase border-b border-gray-200"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((m, i) => (
                <tr
                  key={m.id}
                  className={`border-b border-gray-200 ${i % 2 ? "bg-gray-50" : "bg-white"}`}
                >
                  <td className="px-4 py-3 text-dark text-sm">{m.name}</td>
                  <td className="px-4 py-3 text-dark text-sm">{m.email}</td>
                  <td className="px-4 py-3 text-dark text-sm">
                    {m.professional?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-dark text-sm max-w-xs truncate">
                    {m.message}
                  </td>
                  <td className="px-4 py-3 text-dark text-sm">
                    {fmtDate(m.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => remove(m)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ===============================  SHARED  =============================== */

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
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
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-secondary mb-6">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalActions({
  onClose,
  saving,
  isEditing,
}: {
  onClose: () => void;
  saving: boolean;
  isEditing: boolean;
}) {
  return (
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
        disabled={saving}
        className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition font-medium cursor-pointer disabled:opacity-50"
      >
        {saving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear"}
      </button>
    </div>
  );
}
