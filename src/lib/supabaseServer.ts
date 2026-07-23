import "server-only";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { SUPABASE_MEDIA_BUCKET } from "@/lib/supabaseClient";

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL manquante");
  return url;
}

function getAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY manquante");
  return key;
}

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  return key;
}

/** Client service role — réservé aux scripts (ex. migrate:images), pas à l'upload admin. */
export function createServiceClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client authentifié avec le JWT admin pour les uploads Storage. */
export function createUserClientFromToken(accessToken: string): SupabaseClient {
  return createClient(getSupabaseUrl(), getAnonKey(), {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function verifyAdminSession(
  request: Request
): Promise<
  { user: User; accessToken: string } | { error: string; status: number }
> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Non autorisé", status: 401 };
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return { error: "Non autorisé", status: 401 };
  }

  let anonKey: string;
  try {
    anonKey = getAnonKey();
  } catch {
    return { error: "Configuration Supabase incomplète", status: 500 };
  }

  const authClient = createClient(getSupabaseUrl(), anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    return { error: "Session invalide", status: 401 };
  }

  return { user: data.user, accessToken: token };
}

export { SUPABASE_MEDIA_BUCKET };
