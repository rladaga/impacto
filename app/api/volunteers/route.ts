import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/utils/supabase/server";
import { sendEmail, IMPACTO_INBOX } from "@/lib/email";

// Admin read: the volunteer database (postulaciones + perfiles).
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Join the opportunity title for postulaciones so the admin table reads well.
    const { data, error } = await supabase
      .from("volunteers")
      .select("*, opportunity:volunteer_opportunities(title, entity)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error Supabase volunteers GET:", error);
      return NextResponse.json(
        { error: "Error al obtener voluntarios" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Public insert: single form, two modes (PDF "Voluntariado").
//  - mode "postulation": tied to an opportunity → email entidad + copia IMPACTO
//  - mode "profile":     stored only (base de datos de voluntarios)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      city,
      availability,
      modality,
      interests,
      experience,
      motivation,
      opportunity_id,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 },
      );
    }

    const mode = opportunity_id ? "postulation" : "profile";

    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
      .from("volunteers")
      .insert([
        {
          name,
          email,
          city,
          availability,
          modality,
          interests,
          experience,
          motivation,
          mode,
          opportunity_id: opportunity_id || null,
        },
      ])
      .select();

    if (error) {
      console.error("Error Supabase volunteers POST:", error);
      return NextResponse.json(
        { error: "Error al guardar el voluntario" },
        { status: 500 },
      );
    }

    // Postulación → notificar a la entidad (+ copia a IMPACTO). Best-effort:
    // un fallo de email no rompe el guardado.
    if (mode === "postulation") {
      const { data: opp } = await supabase
        .from("volunteer_opportunities")
        .select("title, entity, entity_email")
        .eq("id", opportunity_id)
        .single();

      const html = `
        <h2>Nueva postulación de voluntariado</h2>
        <p><strong>Oportunidad:</strong> ${opp?.title ?? "—"} (${opp?.entity ?? "—"})</p>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Ciudad:</strong> ${city ?? "—"}</p>
        <p><strong>Disponibilidad:</strong> ${availability ?? "—"}</p>
        <p><strong>Modalidad:</strong> ${modality ?? "—"}</p>
        <p><strong>Intereses:</strong> ${interests ?? "—"}</p>
        <p><strong>Experiencia:</strong> ${experience ?? "—"}</p>
        <p><strong>Motivación:</strong> ${motivation ?? "—"}</p>
      `;

      const recipients = [opp?.entity_email, IMPACTO_INBOX].filter(
        Boolean,
      ) as string[];
      if (recipients.length) {
        await sendEmail({
          to: recipients,
          subject: `Nueva postulación: ${opp?.title ?? "Voluntariado"}`,
          html,
          replyTo: email,
        });
      }
    }

    return NextResponse.json(
      { success: true, message: "Voluntario guardado", data },
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

    const { error } = await supabase.from("volunteers").delete().eq("id", id);

    if (error) {
      console.error("Error Supabase volunteers DELETE:", error);
      return NextResponse.json(
        { error: "Error al eliminar el voluntario" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Voluntario eliminado" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
