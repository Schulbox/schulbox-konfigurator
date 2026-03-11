// app/lib/session.server.ts
// Sichere Cookie-basierte Session-Verwaltung

import { createCookie } from "@remix-run/node";

const sessionCookie = createCookie("sb-session", {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 Tage
  secure: process.env.NODE_ENV === "production",
});

export async function setSupabaseSessionCookie(
  refreshToken: string,
  accessToken: string
): Promise<string> {
  return sessionCookie.serialize({ refreshToken, accessToken });
}

export async function getSupabaseTokensFromSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  const data = (await sessionCookie.parse(cookie)) || {};
  return {
    refresh_token: data.refreshToken as string | null,
    access_token: data.accessToken as string | null,
  };
}

export async function clearSupabaseSession(): Promise<string> {
  return sessionCookie.serialize({}, { maxAge: 0 });
}
