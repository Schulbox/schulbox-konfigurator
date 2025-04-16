// app/routes/_index.tsx

import { Link } from "@remix-run/react";

export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Willkommen bei Schulbox 🎒</h1>
      <p>Starte hier:</p>
      <ul style={{ lineHeight: "2" }}>
        <li>
          <Link to="/login">🔐 Login</Link>
        </li>
        <li>
          <Link to="/register">📝 Registrieren</Link>
        </li>
        <li>
          <Link to="/profil">👤 Mein Profil</Link>
        </li>
        <li>
          <Link to="/app">🧩 Zum App-Konfigurator (nur für Lehrkräfte)</Link>
        </li>
      </ul>
    </main>
  );
}
