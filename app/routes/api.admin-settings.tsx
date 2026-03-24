import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getAuthenticatedSupabase, getUserProfile } from "~/lib/supabase.server";

async function requireAdmin(request: Request) {
  const { supabase, isLoggedIn, user, response } = await getAuthenticatedSupabase(request);
  if (!isLoggedIn || !user) {
    throw json({ error: "Nicht authentifiziert" }, { status: 401 });
  }
  const profile = await getUserProfile(supabase, user.id);
  if (profile?.role !== "admin") {
    throw json({ error: "Nicht autorisiert" }, { status: 403 });
  }
  return { supabase, user, response };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, isLoggedIn, user, response } = await getAuthenticatedSupabase(request);

  // Einstellungen sind öffentlich lesbar (für Schulboxcart etc.)
  const { data: settings } = await supabase
    .from("einstellungen")
    .select("*")
    .single();

  // Benutzer & Schulen nur für Admins
  let benutzer: any[] = [];
  let schulen: any[] = [];

  if (isLoggedIn && user) {
    const profile = await getUserProfile(supabase, user.id);
    if (profile?.role === "admin") {
      const { data: b } = await supabase
        .from("benutzer")
        .select("*")
        .order("created_at", { ascending: false });
      benutzer = b || [];

      const { data: s } = await supabase
        .from("schulen")
        .select("*")
        .order("name", { ascending: true });
      schulen = s || [];
    }
  }

  return json(
    { settings, benutzer, schulen },
    { headers: response.headers }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, response } = await requireAdmin(request);
  const formData = await request.formData();
  const _action = formData.get("_action") as string;

  if (_action === "update_zuschlag") {
    const zuschlag = parseFloat(formData.get("zuschlag") as string);
    if (isNaN(zuschlag) || zuschlag < 0) {
      return json({ error: "Ungültiger Zuschlag" }, { status: 400 });
    }
    const { error } = await supabase
      .from("einstellungen")
      .upsert({ id: 1, werkstatt_zuschlag: zuschlag });
    if (error) {
      return json({ error: "Fehler beim Speichern" }, { status: 500 });
    }
    return json({ success: true, message: "Zuschlag aktualisiert" }, { headers: response.headers });
  }

  if (_action === "update_role") {
    const userId = formData.get("user_id") as string;
    const role = formData.get("role") as string;
    if (!userId || !["elternteil", "lehrkraft", "admin"].includes(role)) {
      return json({ error: "Ungültige Daten" }, { status: 400 });
    }
    const { error } = await supabase
      .from("benutzer")
      .update({ role })
      .eq("user_id", userId);
    if (error) {
      return json({ error: "Fehler beim Aktualisieren der Rolle" }, { status: 500 });
    }
    return json({ success: true, message: `Rolle auf "${role}" geändert` }, { headers: response.headers });
  }

  if (_action === "add_school") {
    const name = formData.get("name") as string;
    const adresse = formData.get("adresse") as string;
    const plz = formData.get("plz") as string;
    const ort = formData.get("ort") as string;
    if (!name) {
      return json({ error: "Schulname erforderlich" }, { status: 400 });
    }
    const { error } = await supabase
      .from("schulen")
      .insert({ name, adresse, plz, ort });
    if (error) {
      return json({ error: "Fehler beim Hinzufügen der Schule" }, { status: 500 });
    }
    return json({ success: true, message: "Schule hinzugefügt" }, { headers: response.headers });
  }

  if (_action === "delete_school") {
    const schoolId = formData.get("school_id") as string;
    if (!schoolId) {
      return json({ error: "Schul-ID erforderlich" }, { status: 400 });
    }
    const { error } = await supabase
      .from("schulen")
      .delete()
      .eq("id", schoolId);
    if (error) {
      return json({ error: "Fehler beim Löschen der Schule" }, { status: 500 });
    }
    return json({ success: true, message: "Schule gelöscht" }, { headers: response.headers });
  }

  if (_action === "update_versand") {
    const versandkosten = parseFloat(formData.get("versandkosten") as string);
    if (isNaN(versandkosten) || versandkosten < 0) {
      return json({ error: "Ungültige Versandkosten" }, { status: 400 });
    }
    const { error } = await supabase
      .from("einstellungen")
      .upsert({ id: 1, versandkosten });
    if (error) {
      return json({ error: "Fehler beim Speichern" }, { status: 500 });
    }
    return json({ success: true, message: "Versandkosten aktualisiert" }, { headers: response.headers });
  }

  if (_action === "toggle_lieferant") {
    const lieferant = formData.get("lieferant") as string;
    const aktiv = formData.get("aktiv") === "true";
    const column = lieferant === "pbs" ? "lieferant_pbs_aktiv" : lieferant === "koerner" ? "lieferant_koerner_aktiv" : null;
    if (!column) {
      return json({ error: "Ungültiger Lieferant" }, { status: 400 });
    }
    const { error } = await supabase
      .from("einstellungen")
      .upsert({ id: 1, [column]: aktiv });
    if (error) {
      return json({ error: "Fehler beim Speichern" }, { status: 500 });
    }
    const label = lieferant === "pbs" ? "PBS" : "Körner";
    return json(
      { success: true, message: `${label} ${aktiv ? "aktiviert" : "deaktiviert"}` },
      { headers: response.headers }
    );
  }

  return json({ error: "Unbekannte Aktion" }, { status: 400 });
}
