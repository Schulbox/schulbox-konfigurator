import { useSchulbox, type SchulboxItem } from "~/context/SchulboxContext";
import { useState, useEffect } from "react";
import { Link, useNavigate, useFetcher } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Trash2, Minus, Plus, ArrowLeft, ArrowRight, Package, School, Sparkles } from "lucide-react";
import SchulboxLoading from "~/components/SchulboxLoading";

type SchuleOption = { id: string; name: string; ort?: string };

export default function SchulboxCart() {
  const {
    items, removeFromBox, clearBox, updateQuantity, totalItems, subtotal,
    swapWithAlternative,
  } = useSchulbox();

  const [schule, setSchule] = useState("");
  const [klasse, setKlasse] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const schulenFetcher = useFetcher<{ schulen: SchuleOption[] }>();

  const [zuschlagProzent, setZuschlagProzent] = useState(10);
  const [schulen, setSchulen] = useState<SchuleOption[]>([]);

  // Schulen und Einstellungen aus Supabase laden
  useEffect(() => {
    schulenFetcher.load("/api/schulen");
    fetch("/api/admin-settings")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.settings?.werkstatt_zuschlag != null) {
          setZuschlagProzent(data.settings.werkstatt_zuschlag);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (schulenFetcher.data?.schulen) {
      setSchulen(schulenFetcher.data.schulen);
    }
  }, [schulenFetcher.data]);

  const zuschlag = subtotal * (zuschlagProzent / 100);
  const gesamt = subtotal + zuschlag;

  if (isCreating) {
    return <SchulboxLoading targetUrl="/webshop" />;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Box className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Deine Schulbox ist noch leer</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Geh in den Konfigurator und füge Schulmaterialien hinzu.
        </p>
        <Link
          to="/konfigurator"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-md"
        >
          Zum Konfigurator
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleDecrease = (item: SchulboxItem) => {
    if (item.quantity <= 1) {
      if (confirm(`„${item.title}" aus der Schulbox entfernen?`)) {
        removeFromBox(item.id);
      }
    } else {
      updateQuantity(item.id, -1);
    }
  };

  const handleCreate = async () => {
    if (!schule || !klasse) {
      setError("Bitte Schule und Klasse auswählen.");
      return;
    }

    setError("");
    setIsCreating(true);

    const formData = new FormData();
    formData.append("items", JSON.stringify(items));
    formData.append("schule", schule);
    formData.append("klasse", klasse);

    try {
      const res = await fetch("/api/erzeuge-schulbox", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        clearBox();
        // Die Animation in SchulboxLoading leitet weiter
      } else {
        setError(data.error || "Fehler beim Erstellen der Schulbox.");
        setIsCreating(false);
      }
    } catch {
      setError("Netzwerkfehler. Bitte versuche es erneut.");
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
          <Link to="/konfigurator" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-600 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Zurück zum Konfigurator
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <Box className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Schulbox zusammenstellen</h1>
              <p className="text-sm text-gray-500">{totalItems} Artikel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Artikelliste */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-sm transition-shadow"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-contain p-1" />
                    ) : (
                      <Package className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{item.price.toFixed(2)} € pro Stück</p>

                    {/* Alternativen anzeigen */}
                    {item.alternatives && item.alternatives.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-[10px] text-gray-400 self-center mr-1">Alternativen:</span>
                        {item.alternatives.map((alt) => (
                          <button
                            key={alt.id}
                            onClick={() => swapWithAlternative(item.id, alt)}
                            className="text-[10px] px-2 py-0.5 bg-accent-50 text-accent-700 rounded-full hover:bg-accent-100 transition-colors"
                          >
                            {alt.title} ({alt.price.toFixed(2)} €)
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecrease(item)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <span className="text-sm font-semibold text-gray-900 w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromBox(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} €</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Schulbox erstellen</h3>

              {/* Schule & Klasse */}
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Schule</label>
                  <select
                    value={schule}
                    onChange={(e) => setSchule(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                  >
                    <option value="">Bitte auswählen</option>
                    {schulen.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}{s.ort ? ` (${s.ort})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Klasse</label>
                  <select
                    value={klasse}
                    onChange={(e) => setKlasse(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                  >
                    <option value="">Bitte auswählen</option>
                    <option value="1A">1A</option>
                    <option value="1B">1B</option>
                    <option value="2A">2A</option>
                    <option value="2B">2B</option>
                    <option value="3A">3A</option>
                    <option value="3B">3B</option>
                    <option value="4A">4A</option>
                    <option value="4B">4B</option>
                  </select>
                </div>
              </div>

              {/* Preisübersicht */}
              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Zwischensumme ({totalItems} Artikel)</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Werkstatt-Zuschlag ({zuschlagProzent}%)</span>
                  <span>{zuschlag.toFixed(2)} €</span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-3 pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-900">Gesamt</span>
                  <span className="text-xl font-bold text-gray-900">{gesamt.toFixed(2)} €</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Preis pro Schulbox inkl. MwSt.</p>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleCreate}
                className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Schulbox erstellen
              </button>

              <button
                onClick={() => clearBox()}
                className="w-full mt-3 text-sm text-gray-500 hover:text-red-500 transition-colors py-2"
              >
                Schulbox leeren
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
