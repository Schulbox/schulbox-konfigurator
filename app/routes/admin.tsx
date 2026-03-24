import { useState, useEffect, useCallback } from "react";
import { useOutletContext, useFetcher } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Save, Users, Package, Shield, CheckCircle, AlertCircle,
  School, Trash2, Plus, ChevronDown, Truck, UserCheck, UserX, Search, Store,
} from "lucide-react";

type OutletContextType = {
  user: { role?: string; email?: string } | null;
  isLoggedIn: boolean;
};

type Benutzer = {
  user_id: string;
  vorname?: string;
  nachname?: string;
  email?: string;
  role: string;
  created_at?: string;
};

type Schule = {
  id: string;
  name: string;
  adresse?: string;
  plz?: string;
  ort?: string;
};

type AdminData = {
  settings: {
    werkstatt_zuschlag: number;
    versandkosten: number;
    lieferant_pbs_aktiv: boolean;
    lieferant_koerner_aktiv: boolean;
  } | null;
  benutzer: Benutzer[];
  schulen: Schule[];
};

export default function AdminPanel() {
  const context = useOutletContext<OutletContextType>();
  const isAdmin = context?.user?.role === "admin";
  const fetcher = useFetcher<any>();
  const dataFetcher = useFetcher<AdminData>();

  const [activeTab, setActiveTab] = useState<"settings" | "users" | "schools">("settings");
  const [zuschlag, setZuschlag] = useState("10");
  const [versandkosten, setVersandkosten] = useState("5.90");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Lieferanten
  const [pbsAktiv, setPbsAktiv] = useState(true);
  const [koernerAktiv, setKoernerAktiv] = useState(true);

  // User management
  const [userSearch, setUserSearch] = useState("");

  // School management
  const [newSchool, setNewSchool] = useState({ name: "", adresse: "", plz: "", ort: "" });
  const [showAddSchool, setShowAddSchool] = useState(false);

  // Daten laden
  useEffect(() => {
    if (isAdmin) {
      dataFetcher.load("/api/admin-settings");
    }
  }, [isAdmin]);

  // Daten setzen wenn geladen
  useEffect(() => {
    if (dataFetcher.data?.settings) {
      setZuschlag(String(dataFetcher.data.settings.werkstatt_zuschlag ?? 10));
      setVersandkosten(String(dataFetcher.data.settings.versandkosten ?? 5.90));
      setPbsAktiv(dataFetcher.data.settings.lieferant_pbs_aktiv !== false);
      setKoernerAktiv(dataFetcher.data.settings.lieferant_koerner_aktiv !== false);
    }
  }, [dataFetcher.data]);

  // Toast bei Aktion
  useEffect(() => {
    if (fetcher.data?.success) {
      setToast({ type: "success", message: fetcher.data.message || "Erfolgreich gespeichert" });
      // Daten neu laden
      dataFetcher.load("/api/admin-settings");
      setShowAddSchool(false);
      setNewSchool({ name: "", adresse: "", plz: "", ort: "" });
    } else if (fetcher.data?.error) {
      setToast({ type: "error", message: fetcher.data.error });
    }
  }, [fetcher.data]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (!context?.isLoggedIn || !isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Zugriff verweigert</h2>
        <p className="text-gray-500">Nur Administratoren können auf diesen Bereich zugreifen.</p>
      </div>
    );
  }

  const benutzer = dataFetcher.data?.benutzer || [];
  const schulen = dataFetcher.data?.schulen || [];
  const isLoading = dataFetcher.state === "loading";

  const filteredUsers = benutzer.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.vorname || "").toLowerCase().includes(q) ||
      (u.nachname || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleSaveZuschlag = () => {
    fetcher.submit(
      { _action: "update_zuschlag", zuschlag },
      { method: "post", action: "/api/admin-settings" }
    );
  };

  const handleToggleLieferant = (lieferant: "pbs" | "koerner", aktiv: boolean) => {
    if (lieferant === "pbs") setPbsAktiv(aktiv);
    else setKoernerAktiv(aktiv);
    fetcher.submit(
      { _action: "toggle_lieferant", lieferant, aktiv: String(aktiv) },
      { method: "post", action: "/api/admin-settings" }
    );
  };

  const handleSaveVersand = () => {
    fetcher.submit(
      { _action: "update_versand", versandkosten },
      { method: "post", action: "/api/admin-settings" }
    );
  };

  const handleUpdateRole = (userId: string, role: string) => {
    fetcher.submit(
      { _action: "update_role", user_id: userId, role },
      { method: "post", action: "/api/admin-settings" }
    );
  };

  const handleAddSchool = () => {
    if (!newSchool.name.trim()) return;
    fetcher.submit(
      { _action: "add_school", ...newSchool },
      { method: "post", action: "/api/admin-settings" }
    );
  };

  const handleDeleteSchool = (schoolId: string) => {
    if (!confirm("Schule wirklich löschen?")) return;
    fetcher.submit(
      { _action: "delete_school", school_id: schoolId },
      { method: "post", action: "/api/admin-settings" }
    );
  };

  const tabs = [
    { id: "settings" as const, label: "Einstellungen", icon: Settings },
    { id: "users" as const, label: "Benutzer", icon: Users },
    { id: "schools" as const, label: "Schulen", icon: School },
  ];

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white focus:outline-none transition-all";

  const roleColors: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    lehrkraft: "bg-blue-100 text-blue-700",
    elternteil: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.div
        className="bg-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Einstellungen, Benutzer und Schulen verwalten</p>

          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === "users" && benutzer.length > 0 && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                    {benutzer.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        )}

        {/* ══════ EINSTELLUNGEN ══════ */}
        {activeTab === "settings" && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Werkstatt-Zuschlag */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Werkstatt-Zuschlag</h2>
                  <p className="text-xs text-gray-500">Prozentualer Aufschlag auf Schulboxen</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Zuschlag in Prozent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={zuschlag}
                      onChange={(e) => setZuschlag(e.target.value)}
                      min="0" max="100" step="0.5"
                      className="w-28 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white focus:outline-none transition-all"
                    />
                    <span className="text-gray-500 text-sm">%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Deckt Beschriftung, Verpackung und Lieferung durch die geschützte Werkstätte.
                  </p>
                </div>
                <button
                  onClick={handleSaveZuschlag}
                  disabled={fetcher.state === "submitting"}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Speichern
                </button>
              </div>
            </div>

            {/* Versandkosten */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Versandkosten</h2>
                  <p className="text-xs text-gray-500">Kosten für Privatlieferung</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Versandkosten in Euro</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={versandkosten}
                      onChange={(e) => setVersandkosten(e.target.value)}
                      min="0" step="0.10"
                      className="w-28 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white focus:outline-none transition-all"
                    />
                    <span className="text-gray-500 text-sm">€</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Wird berechnet, wenn Kunden die Schulbox nach Hause statt an die Schule liefern lassen.
                  </p>
                </div>
                <button
                  onClick={handleSaveVersand}
                  disabled={fetcher.state === "submitting"}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Speichern
                </button>
              </div>
            </div>

            {/* Lieferanten */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Store className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Lieferanten</h2>
                  <p className="text-xs text-gray-500">Artikel eines Lieferanten im Shop ein- oder ausblenden</p>
                </div>
              </div>
              <div className="space-y-4">
                {/* PBS Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">PBS</p>
                    <p className="text-xs text-gray-500">Alle Artikel mit Tag "pbs"</p>
                  </div>
                  <button
                    onClick={() => handleToggleLieferant("pbs", !pbsAktiv)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      pbsAktiv ? "bg-brand-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                        pbsAktiv ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Körner Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Körner</p>
                    <p className="text-xs text-gray-500">Alle Artikel mit Tag "körner"</p>
                  </div>
                  <button
                    onClick={() => handleToggleLieferant("koerner", !koernerAktiv)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                      koernerAktiv ? "bg-brand-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                        koernerAktiv ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-5 h-5 text-brand-500" />
                <h3 className="font-semibold text-gray-900">Schulboxen</h3>
              </div>
              <p className="text-sm text-gray-500">
                Erstellte Schulboxen werden automatisch als Shopify-Produkte angelegt
                und im Shop unter "Schulboxen" angezeigt. Der Zuschlag wird bei der Erstellung berechnet.
              </p>
            </div>
          </motion.div>
        )}

        {/* ══════ BENUTZER ══════ */}
        {activeTab === "users" && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Suche */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Benutzer suchen..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Benutzer-Liste */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">Name</div>
                <div className="col-span-4">E-Mail</div>
                <div className="col-span-2">Rolle</div>
                <div className="col-span-3">Aktionen</div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500 text-sm">
                  Keine Benutzer gefunden
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredUsers.map((user) => (
                    <div key={user.user_id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                      <div className="sm:col-span-3">
                        <p className="text-sm font-medium text-gray-900">
                          {user.vorname || user.nachname
                            ? `${user.vorname || ""} ${user.nachname || ""}`.trim()
                            : "–"}
                        </p>
                      </div>
                      <div className="sm:col-span-4">
                        <p className="text-sm text-gray-500 truncate">{user.email || "–"}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.elternteil}`}>
                          {user.role === "lehrkraft" ? "Lehrkraft" : user.role === "admin" ? "Admin" : "Elternteil"}
                        </span>
                      </div>
                      <div className="sm:col-span-3 flex gap-1.5">
                        {user.role !== "lehrkraft" && (
                          <button
                            onClick={() => handleUpdateRole(user.user_id, "lehrkraft")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                            title="Als Lehrkraft freischalten"
                          >
                            <UserCheck className="w-3 h-3" /> Lehrkraft
                          </button>
                        )}
                        {user.role === "lehrkraft" && (
                          <button
                            onClick={() => handleUpdateRole(user.user_id, "elternteil")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors"
                            title="Lehrkraft-Rolle entfernen"
                          >
                            <UserX className="w-3 h-3" /> Zurücksetzen
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ══════ SCHULEN ══════ */}
        {activeTab === "schools" && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Schule hinzufügen */}
            <div className="mb-6">
              <button
                onClick={() => setShowAddSchool(!showAddSchool)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md"
              >
                <Plus className="w-4 h-4" /> Schule hinzufügen
              </button>
            </div>

            <AnimatePresence>
              {showAddSchool && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Neue Schule</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Schulname *</label>
                        <input
                          value={newSchool.name}
                          onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                          className={inputClass}
                          placeholder="Volksschule Musterstadt"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Adresse</label>
                        <input
                          value={newSchool.adresse}
                          onChange={(e) => setNewSchool({ ...newSchool, adresse: e.target.value })}
                          className={inputClass}
                          placeholder="Schulstraße 1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">PLZ</label>
                        <input
                          value={newSchool.plz}
                          onChange={(e) => setNewSchool({ ...newSchool, plz: e.target.value })}
                          className={inputClass}
                          placeholder="4870"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Ort</label>
                        <input
                          value={newSchool.ort}
                          onChange={(e) => setNewSchool({ ...newSchool, ort: e.target.value })}
                          className={inputClass}
                          placeholder="Vöcklamarkt"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleAddSchool}
                        disabled={!newSchool.name.trim() || fetcher.state === "submitting"}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" /> Hinzufügen
                      </button>
                      <button
                        onClick={() => setShowAddSchool(false)}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Schulen-Liste */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {schulen.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Noch keine Schulen angelegt</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {schulen.map((school) => (
                    <div key={school.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{school.name}</p>
                        <p className="text-xs text-gray-500">
                          {[school.adresse, school.plz, school.ort].filter(Boolean).join(", ") || "Keine Adresse"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSchool(school.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
