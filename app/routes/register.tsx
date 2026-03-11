import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createSupabaseServer } from "~/lib/supabase.server";
import { createShopifyCustomer } from "~/utils/shopify/createShopifyCustomer.server";

type ActionResponse = {
  success?: boolean;
  email?: string;
  error?: string;
  warning?: string;
};

function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const vorname = formData.get("vorname") as string;
  const nachname = formData.get("nachname") as string;

  if (!email || !password || !vorname || !nachname) {
    return json<ActionResponse>({ error: "Alle Pflichtfelder müssen ausgefüllt werden." }, { status: 400 });
  }

  // E-Mail-Validierung
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json<ActionResponse>({ error: "Bitte eine gültige E-Mail-Adresse eingeben." }, { status: 400 });
  }

  if (!isValidPassword(password)) {
    return json<ActionResponse>({
      error: "Mind. 8 Zeichen, Groß-/Kleinbuchstaben, Zahl und Sonderzeichen.",
    }, { status: 400 });
  }

  try {
    const response = new Response();
    const supabase = createSupabaseServer(request, response);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          vorname,
          nachname,
          strasse: formData.get("strasse") as string,
          hausnummer: formData.get("hausnummer") as string,
          tuernummer: formData.get("tuernummer") as string,
          stiege: formData.get("stiege") as string,
          postleitzahl: formData.get("postleitzahl") as string,
          ort: formData.get("ort") as string,
          telefonnummer: formData.get("telefonnummer") as string,
          role: "elternteil",
        },
      },
    });

    if (signUpError || !data.user) {
      const msg = signUpError?.message || "Registrierung fehlgeschlagen.";
      if (msg.includes("already registered")) {
        return json<ActionResponse>({ error: "Diese E-Mail ist bereits registriert." }, { status: 409 });
      }
      return json<ActionResponse>({ error: msg }, { status: 400 });
    }

    // Shopify-Kunden erstellen (nicht-blockierend)
    try {
      await createShopifyCustomer({ email, firstName: vorname, lastName: nachname });
    } catch {
      return json<ActionResponse>({
        success: true,
        email,
        warning: "Konto erstellt. Shop-Synchronisierung steht noch aus.",
      });
    }

    return json<ActionResponse>({ success: true, email });
  } catch {
    return json<ActionResponse>({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}

export default function Register() {
  const navigation = useNavigation();
  const actionData = useActionData<ActionResponse>();
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (actionData?.success) setShowSuccess(true);
  }, [actionData]);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); window.location.href = "/"; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showSuccess]);

  const inputClass = "w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white transition-all";

  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.div
        className="bg-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-2xl mx-auto px-4 py-10 md:py-14 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Konto erstellen</h1>
          <p className="text-gray-400 text-sm">Registriere dich bei Schulbox</p>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {showSuccess && actionData?.email ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Registrierung erfolgreich!</h2>
            <p className="text-gray-500 text-sm mb-4">
              Bestätigung an <strong className="text-gray-900">{actionData.email}</strong> gesendet.
            </p>
            {actionData.warning && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4 text-left">
                <p className="text-amber-700 text-sm">{actionData.warning}</p>
              </div>
            )}
            <p className="text-sm text-gray-400">
              Weiterleitung in {countdown}s ·{" "}
              <a href="/" className="text-brand-600 font-medium">Zur Startseite</a>
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
            {actionData?.error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
                <p className="text-red-600 text-sm">{actionData.error}</p>
              </div>
            )}

            <Form method="post" className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="vorname" className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
                  <input id="vorname" name="vorname" required className={inputClass} placeholder="Max" />
                </div>
                <div>
                  <label htmlFor="nachname" className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
                  <input id="nachname" name="nachname" required className={inputClass} placeholder="Mustermann" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="col-span-2">
                  <label htmlFor="strasse" className="block text-sm font-medium text-gray-700 mb-1">Straße *</label>
                  <input id="strasse" name="strasse" required className={inputClass} placeholder="Musterstraße" />
                </div>
                <div>
                  <label htmlFor="hausnummer" className="block text-sm font-medium text-gray-700 mb-1">Nr. *</label>
                  <input id="hausnummer" name="hausnummer" required className={inputClass} placeholder="12" />
                </div>
                <div>
                  <label htmlFor="tuernummer" className="block text-sm font-medium text-gray-700 mb-1">Tür</label>
                  <input id="tuernummer" name="tuernummer" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="stiege" className="block text-sm font-medium text-gray-700 mb-1">Stiege</label>
                  <input id="stiege" name="stiege" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postleitzahl" className="block text-sm font-medium text-gray-700 mb-1">PLZ *</label>
                  <input id="postleitzahl" name="postleitzahl" required className={inputClass} placeholder="4870" />
                </div>
                <div>
                  <label htmlFor="ort" className="block text-sm font-medium text-gray-700 mb-1">Ort *</label>
                  <input id="ort" name="ort" required className={inputClass} placeholder="Vöcklamarkt" />
                </div>
              </div>

              <div>
                <label htmlFor="telefonnummer" className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input id="telefonnummer" name="telefonnummer" className={inputClass} placeholder="+43 ..." />
              </div>

              <hr className="border-gray-100" />

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-Mail *</label>
                <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} placeholder="name@beispiel.at" />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Passwort *</label>
                <input id="password" name="password" type="password" autoComplete="new-password" required className={inputClass} placeholder="Sicheres Passwort" />
                <p className="text-gray-400 text-xs mt-1.5">Mind. 8 Zeichen, Groß- & Kleinbuchstaben, Zahl & Sonderzeichen.</p>
              </div>

              <button
                type="submit"
                disabled={navigation.state === "submitting"}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {navigation.state === "submitting" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Wird gesendet...
                  </span>
                ) : "Registrieren"}
              </button>
            </Form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Bereits ein Konto?{" "}
              <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">Einloggen</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
