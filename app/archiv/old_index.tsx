// app/routes/_index.tsx

import { Link } from "@remix-run/react";
import { FC } from 'react';

const Configurator: FC = () => {
  return (
    <div>
      <h1>Schulbox Konfigurator 🎒</h1>
      {/* Deine Konfigurator-Logik hier */}
      <p>Füge die gewünschten Artikel zur Schulbox hinzu!</p>
      <button>Schulbox erstellen</button>
    </div>
  );
};

export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Willkommen bei Schulbox 🎒</h1>
      <p>Starte direkt mit dem Konfigurator:</p>
      <Configurator />  {/* Der Konfigurator wird hier direkt eingebunden */}
    </main>
  );
}
