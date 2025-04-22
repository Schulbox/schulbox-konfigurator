// app/routes/auth/callback.tsx
import { LoaderFunctionArgs } from "@remix-run/node";
import { handleCallback } from "lib/shopify/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Verarbeite den OAuth-Callback von Shopify
  return handleCallback(request);
}
