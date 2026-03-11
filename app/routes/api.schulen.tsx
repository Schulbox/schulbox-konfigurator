import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getAuthenticatedSupabase } from "~/lib/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, response } = await getAuthenticatedSupabase(request);

  const { data: schulen } = await supabase
    .from("schulen")
    .select("id, name, ort")
    .order("name", { ascending: true });

  return json({ schulen: schulen || [] }, { headers: response.headers });
}
