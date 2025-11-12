import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, message, interested_in } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email y nombre son requeridos" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("contact_submissions")
      .insert([{ email, name, message, interested_in }]);

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
