import "server-only";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { SUPABASE_MEDIA_BUCKET } from "@/lib/supabaseClient";

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL manquante");
  return url;
}

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  return key;
}

export function createServiceClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function verifyAdminSession(
  request: Request
): Promise<{ user: User } | { error: string; status: number }> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Non autorisé", status: 401 };
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return { error: "Non autorisé", status: 401 };
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!anonKey) {
    return { error: "Configuration Supabase incomplète", status: 500 };
  }

  const authClient = createClient(getSupabaseUrl(), anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    return { error: "Session invalide", status: 401 };
  }

  return { user: data.user };
}

export { SUPABASE_MEDIA_BUCKET };
