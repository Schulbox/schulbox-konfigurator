// app/routes/AuthForm.tsx (oder besser: /components/AuthForm.tsx)

import { useActionData } from "@remix-run/react";

export default function AuthForm({
  mode,
}: {
  mode: "login" | "register";
}) {
  const actionData = useActionData<{ error?: string }>();
  
  const isRegister = mode === "register";

  return (
    <form method="post">
      {isRegister && (
        <>
          <input name="vorname" placeholder="Vorname" required />
          <input name="nachname" placeholder="Nachname" required />
        </>
      )}
      <input name="email" type="email" placeholder="E-Mail" required />
      <input name="password" type="password" placeholder="Passwort" required />
      <button type="submit">
        {isRegister ? "Registrieren" : "Einloggen"}
      </button>
      {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
    </form>
  );
}
