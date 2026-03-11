import { useState, useEffect } from "react";
import { useOutletContext, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import {
  ClipboardList, Package, ExternalLink, Clock, CheckCircle,
  Truck, XCircle, ShoppingBag, ArrowRight,
} from "lucide-react";

type OutletContextType = {
  user: { role?: string; email?: string } | null;
  isLoggedIn: boolean;
};

type Order = {
  id: string;
  name: string;
  created_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  currency: string;
  line_items: { title: string; quantity: number; price: string }[];
  order_status_url?: string;
};

export default function Bestellungen() {
  const context = useOutletContext<OutletContextType>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!context?.isLoggedIn) {
      setLoading(false);
      return;
    }

    fetch("/api/bestellungen")
      .then((r) => {
        if (!r.ok) throw new Error("Fehler beim Laden");
        return r.json();
      })
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Bestellungen konnten nicht geladen werden.");
        setLoading(false);
      });
  }, [context?.isLoggedIn]);

  if (!context?.isLoggedIn) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Bitte einloggen</h2>
        <p className="text-gray-500 mb-6">Logge dich ein, um deine Bestellungen zu sehen.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
        >
          Zum Login <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const statusIcon = (financial: string, fulfillment: string | null) => {
    if (fulfillment === "fulfilled") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (fulfillment === "shipped" || fulfillment === "in_transit") return <Truck className="w-4 h-4 text-blue-500" />;
    if (financial === "refunded" || financial === "voided") return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  const statusLabel = (financial: string, fulfillment: string | null) => {
    if (fulfillment === "fulfilled") return "Geliefert";
    if (fulfillment === "shipped" || fulfillment === "in_transit") return "Unterwegs";
    if (financial === "refunded") return "Erstattet";
    if (financial === "voided") return "Storniert";
    if (financial === "paid") return "Bezahlt";
    return "In Bearbeitung";
  };

  const statusColor = (financial: string, fulfillment: string | null) => {
    if (fulfillment === "fulfilled") return "bg-green-50 text-green-700 border-green-200";
    if (fulfillment === "shipped" || fulfillment === "in_transit") return "bg-blue-50 text-blue-700 border-blue-200";
    if (financial === "refunded" || financial === "voided") return "bg-red-50 text-red-700 border-red-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.div
        className="bg-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Meine Bestellungen</h1>
          <p className="text-gray-400 text-sm">Übersicht aller vergangenen Bestellungen</p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Noch keine Bestellungen</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Du hast noch keine Bestellungen aufgegeben. Stöbere im Shop und bestelle deine erste Schulbox!
            </p>
            <Link
              to="/webshop"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Zum Shop <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString("de-AT", {
                          day: "2-digit", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor(order.financial_status, order.fulfillment_status)}`}>
                      {statusIcon(order.financial_status, order.fulfillment_status)}
                      {statusLabel(order.financial_status, order.fulfillment_status)}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {parseFloat(order.total_price).toFixed(2)} €
                    </span>
                  </div>
                </div>

                {/* Line Items */}
                <div className="px-5 py-3">
                  <div className="space-y-1.5">
                    {order.line_items.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}× {item.title}
                        </span>
                        <span className="text-gray-500 flex-shrink-0 ml-4">
                          {(parseFloat(item.price) * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                    ))}
                    {order.line_items.length > 5 && (
                      <p className="text-xs text-gray-400">
                        + {order.line_items.length - 5} weitere Artikel
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                {order.order_status_url && (
                  <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-50">
                    <a
                      href={order.order_status_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                    >
                      Bestellung ansehen <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
