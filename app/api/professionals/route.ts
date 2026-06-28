import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/utils/supabase/server";

// Public read: powers the /profesionales page (returns all; the page filters
// `active`). Same convention as /api/projects.
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from("professionals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error Supabase professionals GET:", error);
      return NextResponse.json(
        { error: "Error al obtener profesionales" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

const FIELDS = [
  "name",
  "photo",
  "specialty",
  "description_short",
  "description_long",
  "credentials",
  "experience_years",
  "disabilities",
  "ages",
  "modality",
  "location",
  "price",
  "calendly_url",
  "verified",
  "active",
] as const;

function pick(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of FIELDS) {
    if (body[f] !== undefined) out[f] = body[f];
  }
  return out;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json(
        { error: "Nombre es requerido" },
        { status: 400 },
      );
    }

    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("professionals")
      .insert([pick(body)])
      .select();

    if (error) {
      console.error("Error Supabase professionals POST:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: "Profesional guardado", data },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("professionals")
      .update({ ...pick(body), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error Supabase professionals PUT:", error);
      return NextResponse.json(
        { error: "Error al actualizar el profesional" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Profesional actualizado", data },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase.from("professionals").delete().eq("id", id);

    if (error) {
      console.error("Error Supabase professionals DELETE:", error);
      return NextResponse.json(
        { error: "Error al eliminar el profesional" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Profesional eliminado" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
