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
            // Ignorar en server components
          }
        },
      },
    }
  );
}

// GET: Solo para el ADMIN (Protegido)
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error Supabase Contacts:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST: Público (Formulario de contacto)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, location, message, interested_in } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email y nombre son requeridos" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseClient();

    const { error } = await supabase
      .from("contact_submissions")
      .insert([{ email, name, location, message, interested_in }]);

    if (error) {
      console.error("Error Supabase:", error);
      return NextResponse.json(
        { error: "Error al guardar el contacto" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Contacto guardado" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
