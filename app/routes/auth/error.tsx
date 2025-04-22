// app/routes/auth/error.tsx
import { Link } from "@remix-run/react";

export default function AuthError() {
  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Authentifizierungsfehler</h1>
      <p className="mb-6">
        Bei der Authentifizierung mit Shopify ist ein Fehler aufgetreten. 
        Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
      </p>
      <div className="flex justify-center gap-4">
        <Link 
          to="/auth/shopify" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Erneut versuchen
        </Link>
        <Link 
          to="/konfigurator" 
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Zurück zum Konfigurator
        </Link>
      </div>
    </div>
  );
}
