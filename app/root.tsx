import { useEffect, useState, useCallback } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedSupabase, getUserProfile } from "~/lib/supabase.server";
import { CartProvider } from "~/context/CartContext";
import { SchulboxProvider } from "~/context/SchulboxContext";
import { SearchProvider } from "~/context/SearchContext";
import Header from "~/components/Header";
import Footer from "~/components/footer";
import tailwindStyles from "~/styles/tailwind.css?url";

export type User = {
  email?: string;
  role?: string;
  vorname?: string;
  nachname?: string;
  strasse?: string;
  hausnummer?: string;
  tuernummer?: string;
  stiege?: string;
  postleitzahl?: string;
  ort?: string;
  telefonnummer?: string;
} | null;

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, isLoggedIn, user, response } = await getAuthenticatedSupabase(request);

  let userRole: string | null = null;
  if (isLoggedIn && user?.id) {
    const profile = await getUserProfile(supabase, user.id);
    userRole = profile?.role || null;
  }

  return json(
    {
      ENV: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      },
      isLoggedIn,
      userEmail: user?.email || null,
      userRole,
    },
    { headers: response.headers }
  );
}

export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
    { rel: "stylesheet", href: tailwindStyles },
  ];
}

export function meta() {
  return [
    { title: "Schulbox – Dein Schulstart mit einem Klick" },
    { name: "description", content: "Lehrer:innen stellen ein Klassenset zusammen. Eltern bestellen alles mit 1 Klick. Persönlich beschriftet, sozial verpackt, stressfrei bestellt." },
    { name: "keywords", content: "Schulbox, Schulstart, Schulmaterialien, Österreich, Schulbedarf, Klassenset" },
    { property: "og:title", content: "Schulbox – Dein Schulstart mit einem Klick" },
    { property: "og:description", content: "Lehrer:innen stellen ein Klassenset zusammen. Eltern bestellen alles mit 1 Klick." },
    { property: "og:type", content: "website" },
    { name: "theme-color", content: "#16a34a" },
  ];
}

export default function App() {
  const { ENV, isLoggedIn: serverIsLoggedIn, userEmail, userRole: serverUserRole } = useLoaderData<typeof loader>();
  const [user, setUser] = useState<User>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(serverIsLoggedIn);
  const [isLoading, setIsLoading] = useState(true);
  const revalidator = useRevalidator();

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      if (typeof window === "undefined") {
        setIsLoggedIn(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const loggedIn = localStorage.getItem("sb-is-logged-in") === "true" || serverIsLoggedIn;

      if (!loggedIn) {
        setIsLoggedIn(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const refreshToken = localStorage.getItem("sb-refresh-token");
      const accessToken = localStorage.getItem("sb-access-token");

      if (!refreshToken || !accessToken) {
        if (serverIsLoggedIn && userEmail) {
          setIsLoggedIn(true);
          setUser({ email: userEmail, role: serverUserRole || undefined });
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
        setIsLoading(false);
        return;
      }

      // Cache prüfen
      const cached = localStorage.getItem("user-profile-cache");
      const cacheTime = localStorage.getItem("user-profile-cache-time");
      if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
        try {
          const cachedUser = JSON.parse(cached);
          // Server-Rolle hat Vorrang falls Cache veraltet ist
          if (serverUserRole && cachedUser.role !== serverUserRole) {
            cachedUser.role = serverUserRole;
            localStorage.setItem("user-profile-cache", JSON.stringify(cachedUser));
          }
          setUser(cachedUser);
          setIsLoggedIn(true);
          setIsLoading(false);
          return;
        } catch { /* Cache invalid, weiter */ }
      }

      const supabase = createClient(ENV.SUPABASE_URL!, ENV.SUPABASE_ANON_KEY!, {
        auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
      });

      await supabase.auth.setSession({ refresh_token: refreshToken, access_token: accessToken });
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        setIsLoggedIn(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Profil laden (RPC, dann Fallback auf Tabelle, dann user_metadata)
      let profile: any = null;

      const { data: rpcData, error: rpcError } = await supabase
        .rpc("get_benutzer_profil", { user_id_param: authData.user.id });

      if (!rpcError && rpcData?.length > 0) {
        profile = rpcData[0];
      } else {
        // Fallback: direkt aus benutzer-Tabelle lesen
        const { data: tableData } = await supabase
          .from("benutzer")
          .select("*")
          .eq("user_id", authData.user.id)
          .single();
        if (tableData) profile = tableData;
      }

      // Letzter Fallback: user_metadata aus Auth
      const meta = authData.user.user_metadata || {};

      const userData: User = {
        email: authData.user.email,
        role: profile?.role || meta?.role || serverUserRole || "elternteil",
        vorname: profile?.vorname || meta?.vorname || "",
        nachname: profile?.nachname || meta?.nachname || "",
        strasse: profile?.strasse || meta?.strasse || "",
        hausnummer: profile?.hausnummer || meta?.hausnummer || "",
        tuernummer: profile?.tuernummer || meta?.tuernummer || "",
        stiege: profile?.stiege || meta?.stiege || "",
        postleitzahl: profile?.postleitzahl || meta?.postleitzahl || "",
        ort: profile?.ort || meta?.ort || "",
        telefonnummer: profile?.telefonnummer || meta?.telefonnummer || "",
      };

      localStorage.setItem("user-profile-cache", JSON.stringify(userData));
      localStorage.setItem("user-profile-cache-time", Date.now().toString());
      localStorage.setItem("sb-user-id", authData.user.id);

      setUser(userData);
      setIsLoggedIn(true);
    } catch {
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, serverIsLoggedIn, userEmail, serverUserRole]);

  useEffect(() => {
    refreshAuth();

    const handleAuthChange = () => refreshAuth();
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, [refreshAuth]);

  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white min-h-screen text-gray-900 font-sans overflow-x-hidden">
        <CartProvider>
          <SchulboxProvider>
            <SearchProvider>
              <Header user={user} isLoggedIn={isLoggedIn} isLoading={isLoading} />
              <main className="min-h-[calc(100vh-160px)]">
                <Outlet context={{ user, isLoggedIn, isLoading, refreshAuth }} />
              </main>
              <Footer />
            </SearchProvider>
          </SchulboxProvider>
        </CartProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
