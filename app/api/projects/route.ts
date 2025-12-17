import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function getSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorar errores de escritura en contextos donde no se permite
          }
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error Supabase:", error);
      return NextResponse.json(
        { error: "Error al obtener proyectos" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      project_type,
      audience,
      disability_type,
      description,
      address,
      contact,
      lng,
      lat,
      activities,
      public_type,
      image_url,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nombre es requerido" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          name,
          project_type,
          audience,
          disability_type,
          description,
          address,
          contact,
          lng,
          lat,
          activities,
          public_type,
          image_url,
        },
      ])
      .select();

    if (error) {
      console.error("Error Supabase POST:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: "Proyecto guardado", data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      project_type,
      audience,
      disability_type,
      description,
      address,
      contact,
      lng,
      lat,
      activities,
      public_type,
      image_url,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 });
    }

    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from("projects")
      .update({
        name,
        project_type,
        audience,
        disability_type,
        description,
        address,
        contact,
        lng,
        lat,
        activities,
        public_type,
        image_url,
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error Supabase PUT:", error);
      return NextResponse.json(
        { error: "Error al actualizar el proyecto" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Proyecto actualizado", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 });
    }

    const supabase = await getSupabaseClient();

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      console.error("Error Supabase DELETE:", error);
      return NextResponse.json(
        { error: "Error al eliminar el proyecto" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Proyecto eliminado" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
