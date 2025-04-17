import AuthForm from "./AuthForm";
import { json } from "@remix-run/node";
import { supabase } from "../supabaseClient";


export const action = async ({ request }: any) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const vorname = form.get("vorname");
  const nachname = form.get("nachname");

  const { data, error } = await supabase.auth.signUp({
    email: String(email),
    password: String(password),
  });

  if (error) return json({ error: error.message });

  // OPTIONAL: direkt in die `profiles`-Tabelle schreiben
  // (oder per Trigger automatisieren – später)

  return null;
};

export default function RegisterRoute() {
  return <AuthForm mode="register" />;
}
