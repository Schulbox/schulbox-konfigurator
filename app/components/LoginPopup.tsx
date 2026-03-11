import { useNavigate, useRevalidator, useFetcher, useOutletContext } from "@remix-run/react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { X, Package } from "lucide-react";

type LoginResponse = {
  success?: boolean;
  tokens?: { refresh_token: string; access_token: string };
  error?: string;
};

type OutletContextType = {
  refreshAuth: () => Promise<void>;
};

export default function LoginPopup({ onClose }: { onClose: () => void }) {
  const fetcher = useFetcher<LoginResponse>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const popupRef = useRef<HTMLDivElement>(null);
  const revalidator = useRevalidator();
  const outletContext = useOutletContext<OutletContextType | null>();

  // Klick außerhalb
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Login-Erfolg
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.tokens) {
      setIsSubmitting(false);

      localStorage.setItem("sb-refresh-token", fetcher.data.tokens.refresh_token);
      localStorage.setItem("sb-access-token", fetcher.data.tokens.access_token);
      localStorage.setItem("sb-auth-timestamp", Date.now().toString());
      localStorage.setItem("sb-is-logged-in", "true");

      const finish = async () => {
        if (outletContext?.refreshAuth) await outletContext.refreshAuth();
        revalidator.revalidate();
        window.dispatchEvent(new Event("auth-changed"));
        onClose();
      };
      finish();
    } else if (fetcher.data?.error) {
      setIsSubmitting(false);
    }
  }, [fetcher.data, revalidator, onClose, outletContext]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <motion.div
        ref={popupRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
          aria-label="Schließen"
        >
          <X size={18} />
        </button>

        <div className="px-6 pt-8 pb-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-brand-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Anmelden</h2>
            <p className="text-sm text-gray-500 mt-1">Melde dich bei Schulbox an</p>
          </div>

          <fetcher.Form method="post" action="/login" onSubmit={() => setIsSubmitting(true)} className="space-y-4">
            <div>
              <label htmlFor="popup-email" className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input
                id="popup-email" type="email" name="email" required placeholder="name@beispiel.at"
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label htmlFor="popup-password" className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
              <input
                id="popup-password" type="password" name="password" required placeholder="Dein Passwort"
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white transition-all"
              />
            </div>

            {fetcher.data?.error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <p className="text-red-600 text-sm text-center">{fetcher.data.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Anmeldung...
                </div>
              ) : "Einloggen"}
            </button>
          </fetcher.Form>
        </div>

        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4">
          <p className="text-center text-sm text-gray-500">
            Noch kein Konto?{" "}
            <button
              type="button"
              onClick={() => { navigate("/register"); onClose(); }}
              className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              Registrieren
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
