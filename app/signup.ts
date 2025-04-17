import { supabase } from "./supabaseClient";

export async function signUpUser({
  email,
  password,
  profile,
}: {
  email: string;
  password: string;
  profile: {
    Vorname: string;
    Nachname: string;
    Straße: string;
    Hausnummer: string;
    Türnummer: string;
    Stiege: string;
    Postleitzahl: string;
    Ort: string;
    Telefonnummer: string;
  };
}) {
  // 1. Registrieren
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError || !data.user) {
    return { error: signUpError || new Error("Signup failed") };
  }

  // 2. Profil speichern
  const { error: profileError } = await supabase.from("profiles").insert({
    user_id: data.user.id,
    ...profile,
  });

  if (profileError) {
    return { error: profileError };
  }

  return { success: true };
}
