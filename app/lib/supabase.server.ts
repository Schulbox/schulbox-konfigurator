// app/lib/supabase.server.ts
import { createServerClient } from "@supabase/auth-helpers-remix";
import { getSupabaseTokensFromSession } from "./session.server";

export function createSupabaseServer(request: Request, response: Response) {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
}

export async function getAuthenticatedSupabase(request: Request) {
  const { refresh_token, access_token } = await getSupabaseTokensFromSession(request);
  const response = new Response();
  const supabase = createSupabaseServer(request, response);

  let isLoggedIn = false;
  let user = null;

  if (refresh_token && access_token) {
    try {
      const { data } = await supabase.auth.setSession({
        refresh_token,
        access_token,
      });
      if (data?.session) {
        isLoggedIn = true;
        user = data.session.user;
      }
    } catch {
      // Session ungültig
    }
  }

  return { supabase, isLoggedIn, user, response };
}

export async function getUserProfile(supabase: any, userId: string) {
  // Versuche RPC
  const { data: rpcData, error: rpcError } = await supabase
    .rpc("get_benutzer_profil", { user_id_param: userId });

  if (!rpcError && rpcData?.length > 0) {
    return rpcData[0];
  }

  // Fallback: direkte Tabelle
  const { data, error } = await supabase
    .from("benutzer")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!error && data) {
    return data;
  }

  // Erstelle Profil wenn keins existiert
  const { data: newProfile } = await supabase
    .from("benutzer")
    .upsert({ user_id: userId, role: "elternteil" })
    .select()
    .single();

  return newProfile;
}
