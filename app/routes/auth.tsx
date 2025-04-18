// app/routes/auth.tsx
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await authenticate.admin(request);
};
