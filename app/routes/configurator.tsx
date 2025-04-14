import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin } = await authenticate.admin(request);

    console.log("📦 Lade Produkte via Shopify Admin API");

    const response = await admin.rest.get({
      path: "products",
    });

    const products = response?.body?.products?.map((product: any) => ({
      id: product.id,
      title: product.title,
      price: parseFloat(product.variants?.[0]?.price || "0"),
    }));

    if (!products) {
      throw new Error("❌ Keine Produkte gefunden oder Format ungültig.");
    }

    return json({ products });
  } catch (error: any) {
    console.error("💥 Fehler im loader:", error);
    throw new Response("Fehler beim Laden der Produkte", { status: 500 });
  }
};

export default function ConfiguratorRoute() {
  const { products } = useLoaderData<typeof loader>();

  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [schoolName, setSchoolName] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const surcharge = 5.0; // Aufschlag für Werkstätte (anpassbar)

  const addToBox = (product: any) => {
    setSelectedItems((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...items, { ...product, quantity: 1 }];
    });
  };

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ) + surcharge;

  const createBox = () => {
    alert(
      `📦 Schulbox erstellt!\n\n🧑‍🏫 Schule: ${schoolName}\n📚 Klasse: ${schoolClass}\n📅 Lieferung: ${deliveryDate}\n🛍️ Artikel: ${selectedItems.length}\n💶 Gesamt: ${total.toFixed(2)} €`
    );
    // Hier kann später Shopify Admin API verwendet werden, um ein Produkt anzulegen
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">📦 Schulbox-Konfigurator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded p-4 shadow">
            <h2 className="font-semibold">{product.title}</h2>
            <p>{product.price.toFixed(2)} €</p>
            <button
              className="mt-2 bg-blue-600 text-white px-4 py-1 rounded"
              onClick={() => addToBox(product)}
            >
              Hinzufügen
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold">🛒 Deine Schulbox</h2>
        <ul className="list-disc pl-5">
          {selectedItems.map((item) => (
            <li key={item.id}>
              {item.quantity}x {item.title} – {item.price.toFixed(2)} €
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2">
          <label className="block">
            Schule:
            <input
              className="border p-1 ml-2"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </label>
          <label className="block">
            Klasse:
            <input
              className="border p-1 ml-2"
              value={schoolClass}
              onChange={(e) => setSchoolClass(e.target.value)}
            />
          </label>
          <label className="block">
            Lieferdatum:
            <input
              type="date"
              className="border p-1 ml-2"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </label>
        </div>

        <p className="mt-4 font-semibold">💰 Gesamt inkl. Aufschlag: {total.toFixed(2)} €</p>
        <button
          onClick={createBox}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          📦 Schulbox erstellen
        </button>
      </div>
    </div>
  );
}
