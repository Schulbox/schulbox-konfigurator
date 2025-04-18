import AuthForm from "./AuthForm";
import { json } from "@remix-run/node";
import { supabase } from "../../supabaseClient";

export const action = async ({ request }: any) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");

  const { error } = await supabase.auth.signInWithPassword({
    email: String(email),
    password: String(password),
  });

  if (error) return json({ error: error.message });
  return null;
};

export default function LoginRoute() {
  return <AuthForm mode="login" />;
}
