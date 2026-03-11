import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { shopifyAdminRest, shopifyAdmin } from "~/lib/shopify.server";
import { getAuthenticatedSupabase, getUserProfile } from "~/lib/supabase.server";

const PUBLICATION_GIDS = [
  "gid://shopify/Publication/270673871115",
  "gid://shopify/Publication/270673805579",
  "gid://shopify/Publication/270673936651",
  "gid://shopify/Publication/271702917387",
  "gid://shopify/Publication/273434902795",
];

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export const action = async ({ request }: ActionFunctionArgs) => {
  // Auth guard: nur Lehrkräfte und Admins dürfen Schulboxen erstellen
  const { supabase, isLoggedIn, user, response } = await getAuthenticatedSupabase(request);
  if (!isLoggedIn || !user) {
    return json({ error: "Nicht authentifiziert" }, { status: 401 });
  }
  const profile = await getUserProfile(supabase, user.id);
  if (!profile || !["lehrkraft", "admin"].includes(profile.role)) {
    return json({ error: "Nur Lehrkräfte können Schulboxen erstellen" }, { status: 403 });
  }

  const formData = await request.formData();
  const items = JSON.parse(formData.get("items") as string);
  const schule = formData.get("schule") as string;
  const klasse = formData.get("klasse") as string;

  if (!items?.length || !schule || !klasse) {
    return json({ error: "Fehlende Daten" }, { status: 400 });
  }

  const titel = `Schulbox – ${escapeHtml(schule)} – ${escapeHtml(klasse)}`;
  const beschreibung = items
    .map((item: any) => `${item.quantity}x ${escapeHtml(item.title)} – ${item.price.toFixed(2)} €`)
    .join("\n");

  const zwischensumme = items.reduce(
    (sum: number, item: any) => sum + item.quantity * item.price, 0
  );

  // Zuschlag aus Supabase laden
  let zuschlagProzent = 10; // Fallback
  try {
    const { data: settings } = await supabase
      .from("einstellungen")
      .select("werkstatt_zuschlag")
      .single();
    if (settings?.werkstatt_zuschlag != null) {
      zuschlagProzent = settings.werkstatt_zuschlag;
    }
  } catch {
    // Fallback auf 10%
  }
  const gesamtpreis = (zwischensumme * (1 + zuschlagProzent / 100)).toFixed(2);

  try {
    const created = await shopifyAdminRest("products.json", "POST", {
      product: {
        title: titel,
        body_html: `<pre>${beschreibung}</pre><br><strong>+${zuschlagProzent}% für geschützte Werkstätte (Beschriftung, Verpackung & Lieferung)</strong>`,
        tags: ["schulbox"],
        published: true,
        variants: [{
          price: gesamtpreis,
          inventory_management: null,
          fulfillment_service: "manual",
          requires_shipping: true,
        }],
        images: [{
          src: "https://schulbox-mvp.vercel.app/images/schulbox-default.png",
        }],
      },
    });

    if (!created.product?.admin_graphql_api_id) {
      return json({ error: "Produkt konnte nicht erstellt werden" }, { status: 500 });
    }

    const productGid = created.product.admin_graphql_api_id;

    // Auf Vertriebskanälen veröffentlichen
    try {
      await shopifyAdmin(
        `mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
          publishablePublish(id: $id, input: $input) {
            userErrors { field message }
          }
        }`,
        {
          id: productGid,
          input: PUBLICATION_GIDS.map((id) => ({ publicationId: id })),
        }
      );
    } catch {
      // Veröffentlichung fehlgeschlagen, aber Produkt existiert
      return json({
        warning: "Produkt erstellt, aber Veröffentlichung auf Kanälen fehlgeschlagen.",
        handle: created.product.handle,
      });
    }

    return json({
      success: `Die Schulbox „${titel}" wurde erfolgreich erstellt!`,
      handle: created.product.handle,
    });
  } catch (err) {
    return json({ error: "Fehler beim Erstellen des Produkts" }, { status: 500 });
  }
};

export default function NoUI() {
  return null;
}
