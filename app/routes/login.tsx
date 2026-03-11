import { useEffect, useState } from "react";
import { Form, useActionData, useNavigate, Link, useRevalidator } from "@remix-run/react";
import { motion } from "framer-motion";
import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { createSupabaseServer } from "~/lib/supabase.server";
import { setSupabaseSessionCookie } from "~/lib/session.server";

export type LoginResponse = {
  success?: boolean;
  tokens?: { refresh_token: string; access_token: string };
  error?: string;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return json<LoginResponse>({ error: "E-Mail und Passwort sind erforderlich" });
  }

  const response = new Response();
  const supabase = createSupabaseServer(request, response);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return json<LoginResponse>({ error: error.message });
  }

  if (!data.session) {
    return json<LoginResponse>({ error: "Login fehlgeschlagen" });
  }

  const cookie = await setSupabaseSessionCookie(
    data.session.refresh_token,
    data.session.access_token
  );

  return json<LoginResponse>(
    {
      success: true,
      tokens: {
        refresh_token: data.session.refresh_token,
        access_token: data.session.access_token,
      },
    },
    { headers: { "Set-Cookie": cookie } }
  );
}

export default function Login() {
  const actionData = useActionData<LoginResponse>();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (actionData?.success && actionData?.tokens) {
      setIsLoggingIn(true);

      // Tokens für Client-seitige Auth speichern
      localStorage.setItem("sb-refresh-token", actionData.tokens.refresh_token);
      localStorage.setItem("sb-access-token", actionData.tokens.access_token);
      localStorage.setItem("sb-auth-timestamp", Date.now().toString());
      localStorage.setItem("sb-is-logged-in", "true");

      window.dispatchEvent(new Event("auth-changed"));
      revalidator.revalidate();
      navigate("/", { replace: true });
    }
  }, [actionData, navigate, revalidator]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.div
        className="bg-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-md mx-auto px-4 py-10 md:py-14 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Willkommen zurück</h1>
          <p className="text-gray-400 text-sm">Melde dich bei Schulbox an</p>
        </div>
      </motion.div>

      <div className="max-w-md mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Form method="post" className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">E-Mail Adresse</label>
              <input
                id="email" name="email" type="email" autoComplete="email" required
                placeholder="name@beispiel.at"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white focus:outline-none transition-all"
                disabled={isLoggingIn}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Passwort</label>
              <input
                id="password" name="password" type="password" autoComplete="current-password" required
                placeholder="Dein Passwort"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white focus:outline-none transition-all"
                disabled={isLoggingIn}
              />
            </div>

            {actionData?.error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm text-center">{actionData.error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-xl transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Anmeldung läuft...
                </div>
              ) : "Einloggen"}
            </button>
          </Form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Noch kein Konto?{" "}
          <Link to="/register" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
