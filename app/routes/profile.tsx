// app/routes/profile.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/auth.server";

export const loader = async (ctx: LoaderFunctionArgs) => {
  // Hole den eingeloggten Benutzer mit allen Profildaten
  const user = await requireUser(ctx);
  return json({ user });
};

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">👤 Mein Profil</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center text-2xl mr-4">
            {user.vorname?.[0]}{user.nachname?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.vorname} {user.nachname}</h2>
            <p className="text-gray-600">{user.email}</p>
            <span className="inline-block mt-1 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
              {user.role === "lehrkraft" ? "Lehrkraft" : "Eltern"}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Persönliche Informationen</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Vorname</p>
                <p>{user.vorname || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nachname</p>
                <p>{user.nachname || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">E-Mail</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefonnummer</p>
                <p>{user.telefonnummer || "-"}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Adresse</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Straße</p>
                <p>{user.straße || "-"}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Hausnummer</p>
                  <p>{user.hausnummer || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Türnummer</p>
                  <p>{user.türnummer || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stiege</p>
                  <p>{user.stiege || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Postleitzahl</p>
                  <p>{user.postleitzahl || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ort</p>
                  <p>{user.ort || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {user.role === "lehrkraft" && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-3">Lehrkraft-Funktionen</h3>
            <p className="mb-4">Als Lehrkraft haben Sie Zugriff auf folgende Funktionen:</p>
            <a 
              href="/konfigurator" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Zum Schulbox-Konfigurator
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
