import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { clearSupabaseSession } from "~/lib/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const cookie = await clearSupabaseSession();
  return redirect("/", { headers: { "Set-Cookie": cookie } });
}

export default function Logout() {
  return null;
}
