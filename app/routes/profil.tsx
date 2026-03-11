import { useState, useEffect } from "react";
import { Form, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Save, Key, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { getAuthenticatedSupabase, getUserProfile } from "~/lib/supabase.server";

type ProfileData = {
  user_id?: string;
  vorname?: string;
  nachname?: string;
  strasse?: string;
  hausnummer?: string;
  tuernummer?: string;
  stiege?: string;
  postleitzahl?: string;
  ort?: string;
  telefonnummer?: string;
  email?: string;
};

type ActionResponse = {
  success?: boolean;
  passwordChanged?: boolean;
  error?: string | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, isLoggedIn, user, response } = await getAuthenticatedSupabase(request);

  if (!isLoggedIn || !user) {
    return json({ profile: null, error: null, needsClientAuth: true }, { headers: response.headers });
  }

  try {
    const profile = await getUserProfile(supabase, user.id);
    return json({
      profile: profile ? { ...profile, email: user.email } : null,
      error: null,
      needsClientAuth: false,
    }, { headers: response.headers });
  } catch {
    return json({ profile: null, error: "Profil konnte nicht geladen werden.", needsClientAuth: false }, { headers: response.headers });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, isLoggedIn, user, response } = await getAuthenticatedSupabase(request);

  if (!isLoggedIn || !user) {
    return json<ActionResponse>({ success: false, error: "Nicht authentifiziert." });
  }

  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (action === "delete") {
    // Konto löschen – nur Profil in Supabase, nicht Auth-User
    await supabase.from("benutzer").delete().eq("user_id", user.id);
    return json<ActionResponse>({ success: true, error: null });
  }

  const newPassword = formData.get("password") as string;
  let passwordChanged = false;

  if (newPassword && newPassword.length >= 6) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return json<ActionResponse>({ success: false, error: "Passwort konnte nicht geändert werden." });
    }
    passwordChanged = true;
  }

  const profileData = {
    user_id: user.id,
    vorname: formData.get("vorname") as string,
    nachname: formData.get("nachname") as string,
    strasse: formData.get("strasse") as string,
    hausnummer: formData.get("hausnummer") as string,
    tuernummer: formData.get("tuernummer") as string,
    stiege: formData.get("stiege") as string,
    postleitzahl: formData.get("postleitzahl") as string,
    ort: formData.get("ort") as string,
    telefonnummer: formData.get("telefonnummer") as string,
  };

  const { error } = await supabase.from("benutzer").upsert(profileData);
  if (error) {
    return json<ActionResponse>({ success: false, error: "Profil konnte nicht gespeichert werden." });
  }

  // Cache invalidieren
  return json<ActionResponse>({ success: true, passwordChanged, error: null }, { headers: response.headers });
}

export default function ProfilPage() {
  const { profile, error, needsClientAuth } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionResponse>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [localProfile, setLocalProfile] = useState<ProfileData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (needsClientAuth) {
      const isLoggedIn = localStorage.getItem("sb-is-logged-in") === "true";
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }
      const cached = localStorage.getItem("user-profile-cache");
      if (cached) {
        try { setLocalProfile(JSON.parse(cached)); } catch {}
      }
    } else if (profile) {
      setLocalProfile(profile);
    }
    setIsLoading(false);
  }, [profile, needsClientAuth, navigate]);

  useEffect(() => {
    if (actionData?.success) {
      setShowSuccess(true);
      // Cache invalidieren
      localStorage.removeItem("user-profile-cache");
      localStorage.removeItem("user-profile-cache-time");
      setTimeout(() => setShowSuccess(false), 3000);
    } else if (actionData?.error) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  }, [actionData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProfile((prev) => prev ? { ...prev, [e.target.name]: e.target.value } : null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white focus:outline-none transition-all";

  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.div
        className="bg-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-2xl mx-auto px-4 py-10 md:py-14 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Mein Profil</h1>
          <p className="text-gray-400 text-sm">Verwalte deine persönlichen Daten</p>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Benachrichtigungen */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-green-700 text-sm">Profil erfolgreich aktualisiert!</p>
            </motion.div>
          )}
          {(showError || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-red-600 text-sm">{actionData?.error || error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {localProfile && (
          <div className="space-y-6">
            {/* Persönliche Daten */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Persönliche Daten</h2>
              </div>

              <Form method="post" className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500">
                  {localProfile.email} <span className="text-xs">(nicht änderbar)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vorname" className="block text-xs font-medium text-gray-500 mb-1">Vorname</label>
                    <input id="vorname" name="vorname" value={localProfile.vorname || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="nachname" className="block text-xs font-medium text-gray-500 mb-1">Nachname</label>
                    <input id="nachname" name="nachname" value={localProfile.nachname || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="col-span-2">
                    <label htmlFor="strasse" className="block text-xs font-medium text-gray-500 mb-1">Straße</label>
                    <input id="strasse" name="strasse" value={localProfile.strasse || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="hausnummer" className="block text-xs font-medium text-gray-500 mb-1">Nr.</label>
                    <input id="hausnummer" name="hausnummer" value={localProfile.hausnummer || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="tuernummer" className="block text-xs font-medium text-gray-500 mb-1">Tür</label>
                    <input id="tuernummer" name="tuernummer" value={localProfile.tuernummer || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="stiege" className="block text-xs font-medium text-gray-500 mb-1">Stiege</label>
                    <input id="stiege" name="stiege" value={localProfile.stiege || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postleitzahl" className="block text-xs font-medium text-gray-500 mb-1">PLZ</label>
                    <input id="postleitzahl" name="postleitzahl" value={localProfile.postleitzahl || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="ort" className="block text-xs font-medium text-gray-500 mb-1">Ort</label>
                    <input id="ort" name="ort" value={localProfile.ort || ""} onChange={handleInputChange} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label htmlFor="telefonnummer" className="block text-xs font-medium text-gray-500 mb-1">Telefon</label>
                  <input id="telefonnummer" name="telefonnummer" value={localProfile.telefonnummer || ""} onChange={handleInputChange} className={inputClass} />
                </div>

                <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-all hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Änderungen speichern
                </button>
              </Form>
            </div>

            {/* Passwort */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                  <Key className="w-5 h-5 text-accent-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Passwort ändern</h2>
              </div>

              <Form method="post" className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-500 mb-1">Neues Passwort</label>
                  <input id="password" name="password" type="password" minLength={6} placeholder="Mindestens 6 Zeichen" className={inputClass} />
                </div>
                <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-all hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" /> Passwort ändern
                </button>
              </Form>
            </div>

            {/* Konto löschen */}
            <div className="bg-white rounded-2xl border border-red-100 p-6">
              <Form method="post">
                <input type="hidden" name="_action" value="delete" />
                <button
                  type="submit"
                  onClick={(e) => {
                    if (!confirm("Bist du sicher? Dies kann nicht rückgängig gemacht werden.")) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full text-red-600 hover:bg-red-50 font-medium rounded-xl px-4 py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Konto löschen
                </button>
              </Form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

