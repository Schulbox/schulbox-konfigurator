import { json, type ActionFunctionArgs } from "@remix-run/node";
import { shopifyStorefront } from "~/lib/shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { lines, lieferOption, beschriftung, kinderName } = body;

  if (!lines || lines.length === 0) {
    return json({ error: "Keine Artikel im Warenkorb" }, { status: 400 });
  }

  // Note-Attribute für Shopify Checkout
  const note = [
    lieferOption === "schule" ? "Lieferung: An die Schule" : "Lieferung: Privat",
    beschriftung ? `Beschriftung: Ja – Name: ${kinderName}` : "Beschriftung: Nein",
  ].join(" | ");

  const data = await shopifyStorefront(
    `mutation createCart($lines: [CartLineInput!]!, $note: String) {
      cartCreate(input: { lines: $lines, note: $note }) {
        cart { checkoutUrl }
        userErrors { message }
      }
    }`,
    { lines, note }
  );

  const checkoutUrl = data.cartCreate?.cart?.checkoutUrl;
  if (!checkoutUrl) {
    const errors = data.cartCreate?.userErrors?.map((e: any) => e.message).join(", ");
    return json({ error: errors || "Checkout konnte nicht erstellt werden" }, { status: 500 });
  }

  return json({ checkoutUrl });
}
