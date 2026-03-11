import { useCart } from "~/context/CartContext";
import { useOutletContext, Link } from "@remix-run/react";
import { useState } from "react";
import LoginPopup from "~/components/LoginPopup";
import { createShopifyCheckoutUrl } from "~/lib/shopify.server";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trash2, ArrowRight, ShoppingCart, Package, Minus, Plus, School, Home, Pen, X } from "lucide-react";

type OutletContextType = {
  user: any;
  isLoggedIn: boolean;
  isLoading: boolean;
};

export default function Warenkorb() {
  const { items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity } = useCart();
  const outletContext = useOutletContext<OutletContextType | null>();
  const [showLogin, setShowLogin] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Schulbox-Optionen
  const [lieferOption, setLieferOption] = useState<"schule" | "privat">("schule");
  const [beschriftung, setBeschriftung] = useState(true);
  const [kinderName, setKinderName] = useState("");

  // Prüfe ob Schulbox-Produkte im Warenkorb sind
  const hasSchulbox = items.some((i) => i.title.toLowerCase().includes("schulbox"));
  const versandkosten = lieferOption === "privat" ? 5.90 : 0;
  const endpreis = totalPrice + versandkosten;

  const handleCheckout = async () => {
    if (!outletContext?.isLoggedIn) {
      setShowLogin(true);
      return;
    }

    if (hasSchulbox && beschriftung && !kinderName.trim()) {
      alert("Bitte gib den Namen des Kindes für die Beschriftung ein.");
      return;
    }

    setIsCheckingOut(true);
    const lineItems = items.map((item) => ({
      merchandiseId: item.variantId,
      quantity: item.quantity,
    }));

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lineItems,
          lieferOption,
          beschriftung,
          kinderName: beschriftung ? kinderName : "",
        }),
      });
      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Fehler beim Erstellen des Checkouts.");
        setIsCheckingOut(false);
      }
    } catch {
      alert("Netzwerkfehler. Bitte versuche es erneut.");
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-160px)]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Warenkorb</h1>
              <p className="text-sm text-gray-500">{totalItems} Artikel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Dein Warenkorb ist leer</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Stöbere in unserem Shop und füge Produkte hinzu.</p>
            <Link
              to="/webshop"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-md active:scale-[0.98]"
            >
              Zum Webshop
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
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
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain p-1" loading="lazy" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{item.price.toFixed(2)} € pro Stück</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => item.quantity <= 1 ? removeFromCart(item.id) : updateQuantity(item.id, -1)}
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
                          onClick={() => removeFromCart(item.id)}
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
                <h3 className="text-lg font-bold text-gray-900 mb-4">Bestellübersicht</h3>

                {/* Schulbox-Optionen */}
                {hasSchulbox && (
                  <div className="mb-4 space-y-3 pb-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Schulbox-Optionen</p>

                    {/* Lieferoption */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setLieferOption("schule")}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          lieferOption === "schule"
                            ? "border-brand-500 bg-brand-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <School className={`w-5 h-5 ${lieferOption === "schule" ? "text-brand-600" : "text-gray-400"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">An die Schule</p>
                          <p className="text-xs text-gray-500">Zum Schulbeginn, inkl. Werkstatt-Service</p>
                        </div>
                        <span className="text-xs font-medium text-brand-600">Gratis</span>
                      </button>
                      <button
                        onClick={() => setLieferOption("privat")}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          lieferOption === "privat"
                            ? "border-brand-500 bg-brand-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Home className={`w-5 h-5 ${lieferOption === "privat" ? "text-brand-600" : "text-gray-400"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Nach Hause</p>
                          <p className="text-xs text-gray-500">Direkter Versand an deine Adresse</p>
                        </div>
                        <span className="text-xs font-medium text-gray-500">+ 5,90 €</span>
                      </button>
                    </div>

                    {/* Beschriftung */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setBeschriftung(!beschriftung)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          beschriftung ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Pen className={`w-5 h-5 ${beschriftung ? "text-brand-600" : "text-gray-400"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Persönliche Beschriftung</p>
                          <p className="text-xs text-gray-500">Name des Kindes auf allen Materialien</p>
                        </div>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                          beschriftung ? "bg-brand-500 border-brand-500" : "border-gray-300"
                        }`}>
                          {beschriftung && <span className="text-white text-xs">✓</span>}
                        </div>
                      </button>

                      {beschriftung && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <input
                            type="text"
                            value={kinderName}
                            onChange={(e) => setKinderName(e.target.value)}
                            placeholder="Name des Kindes"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* Preise */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Zwischensumme ({totalItems} Artikel)</span>
                    <span>{totalPrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Versand</span>
                    <span className={versandkosten === 0 ? "text-brand-600 font-medium" : ""}>
                      {versandkosten === 0 ? "Kostenlos" : `${versandkosten.toFixed(2)} €`}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-bold text-gray-900">Gesamt</span>
                    <span className="text-xl font-bold text-gray-900">{endpreis.toFixed(2)} €</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">inkl. MwSt.</p>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Wird geladen...
                    </>
                  ) : (
                    <>
                      Zur Kasse
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <Link to="/webshop" className="block text-center text-sm text-gray-500 hover:text-brand-600 mt-4 transition-colors">
                  Weiter einkaufen
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
    </div>
  );
}
