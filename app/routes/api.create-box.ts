// app/routes/api.create-box.ts
import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  try {
    const body = await request.json();
    const { school, klasse, deliveryDate, items, total } = body;

    if (!school || !klasse || !deliveryDate || !items || !Array.isArray(items) || items.length === 0) {
      return json({ error: "❌ Ungültige Anfrage: Bitte alle Felder ausfüllen und mindestens ein Produkt hinzufügen." }, { status: 400 });
    }

    const title = `Schulbox – ${school} – ${klasse}`;
    const description = `Diese Schulbox enthält ${items.length} Artikel für die Klasse ${klasse} der ${school}. Lieferdatum: ${deliveryDate}.`;

    const productData = {
      product: {
        title,
        body_html: description,
        vendor: "Schulbox",
        product_type: "Schulmaterial",
        tags: ["Schulbox", school, klasse],
        variants: [
          {
            price: total.toFixed(2),
            title: "Standard",
            sku: `SB-${klasse}-${Date.now()}`,
          },
        ],
      },
    };

    const response = await admin.rest.post({
      path: "products",
      data: productData,
      type: "application/json",
    });

    return json({
      success: true,
      message: "✅ Schulbox erfolgreich erstellt.",
      productId: response?.body?.product?.id,
    });

  } catch (err: any) {
    console.error("❌ Fehler beim Erstellen der Schulbox:", err);
    return json({ error: "Ein Fehler ist beim Erstellen der Schulbox aufgetreten." }, { status: 500 });
  }
};
