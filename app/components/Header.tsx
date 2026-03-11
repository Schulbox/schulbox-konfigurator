import { Link, useNavigate, useRevalidator, useFetcher, useOutletContext } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import {
  User, ShoppingCart, Menu, X, ChevronDown, Package, Search,
  Home, Store, Box, Users, LogIn, UserPlus, LogOut, Settings,
  ClipboardList,
} from "lucide-react";
import LoginPopup from "./LoginPopup";
import { useCart } from "~/context/CartContext";
import { useSearch } from "~/context/SearchContext";

export type UserType = {
  vorname?: string;
  nachname?: string;
  role?: string;
  email?: string;
} | null;

type OutletContextType = {
  user: UserType;
  isLoggedIn: boolean;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
};

const NavLink = ({
  icon: Icon, label, to, onClick, className = "",
}: {
  icon: React.ElementType; label: string; to?: string; onClick?: () => void; className?: string;
}) => {
  const base = "flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors w-full text-left text-gray-300 hover:text-white";
  if (to) {
    return (
      <Link to={to} className={`${base} ${className}`} onClick={onClick}>
        <Icon size={18} className="text-gray-500 flex-shrink-0" />
        <span className="text-sm">{label}</span>
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={`${base} ${className}`}>
      <Icon size={18} className="text-gray-500 flex-shrink-0" />
      <span className="text-sm">{label}</span>
    </button>
  );
};

export default function Header({
  user, isLoggedIn, isLoading,
}: {
  user: UserType; isLoggedIn: boolean; isLoading: boolean;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const logoutFetcher = useFetcher();
  const { totalItems, justAdded, clearCart } = useCart();
  const { triggerSearch } = useSearch();
  const [inputValue, setInputValue] = useState("");
  const [mounted, setMounted] = useState(false);

  const outletContext = useOutletContext<OutletContextType | null>();
  const refreshAuth = outletContext?.refreshAuth;

  useEffect(() => { setMounted(true); }, []);

  // Klick außerhalb Dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Klick außerhalb Mobile-Menu
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") triggerSearch(inputValue);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    clearCart();

    localStorage.removeItem("sb-refresh-token");
    localStorage.removeItem("sb-access-token");
    localStorage.removeItem("sb-auth-timestamp");
    localStorage.removeItem("user-profile-cache");
    localStorage.removeItem("user-profile-cache-time");
    localStorage.setItem("sb-is-logged-in", "false");

    logoutFetcher.submit(null, { method: "post", action: "/logout" });
    if (refreshAuth) await refreshAuth();
    revalidator.revalidate();
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };

  const displayName = user
    ? (user.vorname || user.nachname
      ? `${user.vorname ?? ""} ${user.nachname ?? ""}`.trim()
      : user.email?.split("@")[0])
    : "";

  const isTeacher = user?.role === "lehrkraft";
  const isAdmin = user?.role === "admin";

  return (
    <>
      <header className="bg-gray-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <Package className="w-6 h-6 text-brand-400" />
            <span className="text-lg font-bold text-white hidden sm:inline">Schulbox</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
            <Link to="/webshop" className="px-3 py-1.5 rounded-md text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">Shop</Link>
            <Link to="/schulboxen" className="px-3 py-1.5 rounded-md text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">Schulboxen</Link>
            <Link to="/ueber-uns" className="px-3 py-1.5 rounded-md text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">Über uns</Link>
            {(isTeacher || isAdmin) && (
              <Link to="/konfigurator" className="px-3 py-1.5 rounded-md text-sm text-brand-400 hover:text-brand-300 hover:bg-gray-800 transition-colors font-medium">Konfigurator</Link>
            )}
          </nav>

          {/* Suchleiste */}
          <div className="flex-1 max-w-md mx-2 md:mx-6">
            <div className="flex items-center bg-white rounded-lg overflow-hidden h-8">
              <input
                type="text"
                placeholder="Produkte suchen..."
                className="flex-1 bg-transparent border-none px-3 py-0 text-xs text-gray-900 placeholder-gray-400 focus:outline-none h-full"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleSearch}
              />
              <button
                type="button"
                onClick={() => triggerSearch(inputValue)}
                className="h-full px-3 flex items-center justify-center text-gray-400 hover:text-brand-500 transition-colors border-l border-gray-200"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rechts */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Desktop User */}
            {isLoading ? (
              <div className="hidden md:flex items-center px-2">
                <div className="w-3.5 h-3.5 border-2 border-gray-600 border-t-brand-400 rounded-full animate-spin" />
              </div>
            ) : isLoggedIn && user ? (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-600/20 flex items-center justify-center">
                    <User size={12} className="text-brand-400" />
                  </div>
                  <span className="max-w-[140px] truncate text-sm">{displayName}</span>
                  <motion.span animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  </motion.span>
                </button>

                <Transition
                  show={userMenuOpen}
                  enter="transition ease-out duration-150"
                  enterFrom="opacity-0 scale-95 -translate-y-1"
                  enterTo="opacity-100 scale-100 translate-y-0"
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl bg-white border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Eingeloggt als</p>
                      <p className="text-sm font-medium text-gray-900 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/profil" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User size={14} className="text-gray-400" /> Profil
                      </Link>
                      <Link to="/bestellungen" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <ClipboardList size={14} className="text-gray-400" /> Bestellungen
                      </Link>
                      {(isTeacher || isAdmin) && (
                        <Link to="/konfigurator" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Package size={14} className="text-gray-400" /> Box Konfigurator
                        </Link>
                      )}
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Settings size={14} className="text-gray-400" /> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={14} /> Ausloggen
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            ) : (
              <button
                onClick={() => setLoginPopupOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <User size={15} /> Einloggen
              </button>
            )}

            {/* Warenkorb */}
            <Link to="/warenkorb" className="relative p-2 rounded-md hover:bg-gray-800 transition-colors">
              <ShoppingCart className="h-5 w-5 text-gray-300" />
              {totalItems > 0 && (
                <motion.div
                  key={totalItems}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: justAdded ? [1, 1.3, 1] : 1, opacity: 1 }}
                  className="absolute -top-1 -right-1 bg-brand-400 text-gray-900 text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm"
                >
                  {totalItems}
                </motion.div>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mounted && mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />,
        document.body
      )}

      {/* Mobile Slide-Over */}
      {mounted && createPortal(
        <div
          ref={mobileMenuRef}
          className={`fixed top-0 right-0 h-full z-[999] bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } w-[280px]`}
        >
          <div className="bg-gray-800 px-5 py-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-600/20 flex items-center justify-center">
                <User size={16} className="text-brand-400" />
              </div>
              <div>
                {user ? (
                  <>
                    <p className="text-sm font-semibold text-white">{user.vorname || "Willkommen"}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-gray-300">Willkommen</p>
                )}
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-700 transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="px-3 py-4 overflow-y-auto" style={{ height: "calc(100% - 72px)" }}>
            <nav className="space-y-0.5">
              <NavLink icon={Home} label="Home" to="/" onClick={() => setMobileMenuOpen(false)} />
              <NavLink icon={Store} label="Shop" to="/webshop" onClick={() => setMobileMenuOpen(false)} />
              <NavLink icon={Package} label="Schulboxen" to="/schulboxen" onClick={() => setMobileMenuOpen(false)} />
              <NavLink icon={Users} label="Über uns" to="/ueber-uns" onClick={() => setMobileMenuOpen(false)} />
              {(isTeacher || isAdmin) && (
                <NavLink icon={Box} label="Box Konfigurator" to="/konfigurator" onClick={() => setMobileMenuOpen(false)} />
              )}
              {isLoggedIn && (
                <>
                  <hr className="my-3 border-gray-700" />
                  <NavLink icon={Settings} label="Profil" to="/profil" onClick={() => setMobileMenuOpen(false)} />
                  <NavLink icon={ClipboardList} label="Bestellungen" to="/bestellungen" onClick={() => setMobileMenuOpen(false)} />
                  {isAdmin && (
                    <NavLink icon={Settings} label="Admin" to="/admin" onClick={() => setMobileMenuOpen(false)} />
                  )}
                  <hr className="my-3 border-gray-700" />
                  <NavLink icon={LogOut} label="Ausloggen" onClick={handleLogout} className="!text-red-400 hover:!text-red-300 hover:!bg-red-900/30" />
                </>
              )}
              {!isLoggedIn && (
                <>
                  <hr className="my-3 border-gray-700" />
                  <NavLink icon={LogIn} label="Einloggen" onClick={() => { setLoginPopupOpen(true); setMobileMenuOpen(false); }} />
                  <NavLink icon={UserPlus} label="Registrieren" to="/register" onClick={() => setMobileMenuOpen(false)} />
                </>
              )}
            </nav>
          </div>
        </div>,
        document.body
      )}

      {/* Login Popup */}
      {mounted && loginPopupOpen && createPortal(
        <LoginPopup onClose={() => setLoginPopupOpen(false)} />,
        document.body
      )}
    </>
  );
}
