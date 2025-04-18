import { json } from "@remix-run/node";
import { supabase } from "../../supabaseClient";
import AuthForm from "./AuthForm";  // Hier bleibt der Import von AuthForm wichtig

export const action = async ({ request }: any) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const vorname = form.get("vorname");
  const nachname = form.get("nachname");
  const strasse = form.get("strasse");
  const hausnummer = form.get("hausnummer");
  const tuernummer = form.get("tuernummer") || null; // Optional
  const stiege = form.get("stiege") || null; // Optional
  const postleitzahl = form.get("postleitzahl");
  const ort = form.get("ort");
  const telefonnummer = form.get("telefonnummer") || null; // Optional

  const { data, error } = await supabase.auth.signUp({
    email: String(email),
    password: String(password),
  });

  if (error) {
    return json({ error: error.message });
  }

  // Wenn `data.user` null ist, returniere einen Fehler
  if (!data.user) {
    return json({ error: "Benutzer konnte nicht erstellt werden. Bitte versuche es später erneut." });
  }

  // Erstelle den Benutzer in der Tabelle `users`
  const { error: insertError } = await supabase
    .from("users")
    .insert([
      {
        user_id: data.user.id, // Hier ist der Zugriff auf data.user.id sicher, weil wir geprüft haben, dass data.user existiert
        vorname: String(vorname),
        nachname: String(nachname),
        strasse: String(strasse),
        hausnummer: String(hausnummer),
        tuernummer: tuernummer,
        stiege: stiege,
        postleitzahl: String(postleitzahl),
        ort: String(ort),
        telefonnummer: telefonnummer,
      },
    ]);

  if (insertError) {
    return json({ error: insertError.message });
  }

  return json({ message: "Registration successful!" });
};

export default function RegisterRoute() {
  return <AuthForm mode="register" />;
}
