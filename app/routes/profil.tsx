import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "@remix-run/react";

export default function Profil() {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        // Nicht eingeloggt → redirect nach /login
        navigate("/login");
        return;
      }

      const user = sessionData.session.user;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Fehler beim Laden des Profils:", error.message);
        return;
      }

      setProfile(data);
    }

    loadProfile();
  }, [navigate]);

  if (!profile) {
    return <p>Lade Profil...</p>;
  }

  return (
    <div>
      <h1>Willkommen {profile.Vorname} {profile.Nachname}</h1>
      <p>Adresse: {profile.Straße} {profile.Hausnummer}, {profile.Postleitzahl} {profile.Ort}</p>
      <p>Telefon: {profile.Telefonnummer}</p>
      <p>E-Mail: {profile.email}</p>
    </div>
  );
}
