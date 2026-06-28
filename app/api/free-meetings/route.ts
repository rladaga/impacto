import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/utils/supabase/server";
import { sendEmail, IMPACTO_INBOX } from "@/lib/email";

// Admin read: trazabilidad de encuentros gratuitos solicitados.
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("free_meetings")
      .select("*, professional:professionals(name, specialty)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error Supabase free_meetings GET:", error);
      return NextResponse.json(
        { error: "Error al obtener encuentros" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Public insert: parte del flujo unificado de "Solicitar encuentro gratuito"
// (PDF "Profesionales"). Se registra para trazabilidad y se envía copia a
// IMPACTO antes de mostrar el calendario de Calendly.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, professional_id } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 },
      );
    }

    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from("free_meetings")
      .insert([
        {
          name,
          email,
          message,
          professional_id: professional_id || null,
        },
      ])
      .select();

    if (error) {
      console.error("Error Supabase free_meetings POST:", error);
      return NextResponse.json(
        { error: "Error al guardar la solicitud" },
        { status: 500 },
      );
    }

    // Copia a IMPACTO para trazabilidad (best-effort).
    if (IMPACTO_INBOX) {
      let proName = "—";
      if (professional_id) {
        const { data: pro } = await supabase
          .from("professionals")
          .select("name, specialty")
          .eq("id", professional_id)
          .single();
        if (pro) proName = `${pro.name} (${pro.specialty ?? ""})`;
      }

      await sendEmail({
        to: IMPACTO_INBOX,
        subject: `Solicitud de encuentro gratuito — ${proName}`,
        html: `
          <h2>Nueva solicitud de encuentro gratuito</h2>
          <p><strong>Profesional:</strong> ${proName}</p>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mensaje:</strong> ${message ?? "—"}</p>
        `,
        replyTo: email,
      });
    }

    return NextResponse.json(
      { success: true, message: "Solicitud guardada", data },
      { status: 201 },
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

    const { error } = await supabase.from("free_meetings").delete().eq("id", id);

    if (error) {
      console.error("Error Supabase free_meetings DELETE:", error);
      return NextResponse.json(
        { error: "Error al eliminar la solicitud" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Solicitud eliminada" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
