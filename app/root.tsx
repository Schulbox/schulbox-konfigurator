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
  const { isLoggedIn, user, response } = await getAuthenticatedSupabase(request);

  return json(
    {
      ENV: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      },
      isLoggedIn,
      userEmail: user?.email || null,
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
  const { ENV, isLoggedIn: serverIsLoggedIn, userEmail } = useLoaderData<typeof loader>();
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
        setIsLoggedIn(serverIsLoggedIn);
        if (serverIsLoggedIn && userEmail) {
          setUser({ email: userEmail });
        }
        setIsLoading(false);
        return;
      }

      // Cache prüfen
      const cached = localStorage.getItem("user-profile-cache");
      const cacheTime = localStorage.getItem("user-profile-cache-time");
      if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
        try {
          setUser(JSON.parse(cached));
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

      // Profil laden
      const { data: profileData } = await supabase
        .rpc("get_benutzer_profil", { user_id_param: authData.user.id });

      const profile = profileData?.[0];
      const userData: User = {
        email: authData.user.email,
        role: profile?.role || "elternteil",
        vorname: profile?.vorname,
        nachname: profile?.nachname,
        strasse: profile?.strasse,
        hausnummer: profile?.hausnummer,
        tuernummer: profile?.tuernummer,
        stiege: profile?.stiege,
        postleitzahl: profile?.postleitzahl,
        ort: profile?.ort,
        telefonnummer: profile?.telefonnummer,
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
  }, [ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, serverIsLoggedIn, userEmail]);

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
