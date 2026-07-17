import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Shared server-side Supabase client for API routes (reads/writes cookies for
// auth). Mirrors the inline helper used in the projects/contact routes.
export async function getSupabaseServerClient() {
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
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignorar en server components
          }
        },
      },
    },
  );
}
