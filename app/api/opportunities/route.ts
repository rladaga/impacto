import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/utils/supabase/server";

// Public read: powers the /voluntariado carousel (returns all; page filters
// is_active). Admin manages via POST/PUT/DELETE.
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from("volunteer_opportunities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error Supabase opportunities GET:", error);
      return NextResponse.json(
        { error: "Error al obtener oportunidades" },
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
  "title",
  "entity",
  "entity_email",
  "area",
  "about_project",
  "role",
  "image_url",
  "location",
  "hours",
  "start_date",
  "is_active",
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
    if (!body.title) {
      return NextResponse.json(
        { error: "Título es requerido" },
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
      .from("volunteer_opportunities")
      .insert([pick(body)])
      .select();

    if (error) {
      console.error("Error Supabase opportunities POST:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: "Oportunidad guardada", data },
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
      .from("volunteer_opportunities")
      .update({ ...pick(body), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error Supabase opportunities PUT:", error);
      return NextResponse.json(
        { error: "Error al actualizar la oportunidad" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Oportunidad actualizada", data },
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

    const { error } = await supabase
      .from("volunteer_opportunities")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error Supabase opportunities DELETE:", error);
      return NextResponse.json(
        { error: "Error al eliminar la oportunidad" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Oportunidad eliminada" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
