import { useState } from "react";
import { useSearchParams } from "@remix-run/react"; // Für Redirect-Parameter

export default function Login() {
  const [email, setEmail] = useState(""); // Zustand für Email
  const [password, setPassword] = useState(""); // Zustand für Passwort
  const [error, setError] = useState<string | null>(null); // Zustand für Fehlernachricht
  const [searchParams] = useSearchParams(); // Hole Query-Parameter
  const redirectTo = searchParams.get("redirectTo") || "/"; // Standardweiterleitung zur Homepage, falls kein Parameter vorhanden

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Verwenden von fetch, um die Anfrage als JSON zu senden
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Wir senden JSON
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();  // Wir erwarten JSON-Antwort

    if (data.error) {
      setError(data.error.message); // Wenn ein Fehler zurückgegeben wird, setzen wir diesen als Error
    } else {
      window.location.href = redirectTo; // Weiterleitung nach dem Login
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Aktualisiere den Zustand für die E-Mail
          placeholder="E-Mail"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Aktualisiere den Zustand für das Passwort
          placeholder="Passwort"
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
