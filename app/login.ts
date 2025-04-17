import { supabase } from "./supabaseClient";

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error };
  }

  return { session: data.session, user: data.user };
}
