import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useCart } from "~/context/CartContext";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Check, Truck, Package, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getProductByHandle } from "~/lib/shopify.server";
import { getAuthenticatedSupabase } from "~/lib/supabase.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  if (!params.handle) {
    throw new Response("Kein Produkt angegeben", { status: 400 });
  }
  const product = await getProductByHandle(params.handle);
  if (!product) {
    throw new Response("Produkt nicht gefunden", { status: 404 });
  }

  // Prüfen ob Lieferant deaktiviert ist
  const { supabase } = await getAuthenticatedSupabase(request);
  const { data: settings } = await supabase
    .from("einstellungen")
    .select("lieferant_pbs_aktiv, lieferant_koerner_aktiv")
    .single();

  const tags: string[] = product.tags || [];
  if (settings?.lieferant_pbs_aktiv === false && tags.includes("pbs")) {
    throw new Response("Produkt nicht verfügbar", { status: 404 });
  }
  if (settings?.lieferant_koerner_aktiv === false && tags.includes("körner")) {
    throw new Response("Produkt nicht verfügbar", { status: 404 });
  }

  return json(product);
}

export default function ProductDetailPage() {
  const product = useLoaderData<typeof loader>();
  const images = product.images.edges.map((e: any) => e.node);
  const variantId = product.variants?.edges?.[0]?.node?.id || product.id;
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      variantId,
      title: product.title,
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      image: images[0]?.url || "",
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const currency = product.priceRange.minVariantPrice.currencyCode === "EUR" ? "€" : product.priceRange.minVariantPrice.currencyCode;

  // Schulbox-Produkt erkennen
  const isSchulbox = (product.tags || []).includes("schulbox");

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-6 md:py-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={isSchulbox ? "/schulboxen" : "/webshop"}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {isSchulbox ? "Zurück zu den Schulboxen" : "Zurück zum Shop"}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Bilder */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 overflow-hidden">
            {images.length > 0 ? (
              <div className="relative aspect-square flex items-center justify-center">
                <img
                  src={images[activeImage]?.url}
                  alt={images[activeImage]?.altText || product.title}
                  className="max-h-full max-w-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-sm transition-all"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center text-gray-300">
                <Package className="w-16 h-16" />
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 overflow-hidden transition-all ${
                    activeImage === i ? "border-brand-500 shadow-sm" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-contain" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{product.title}</h1>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{price.toFixed(2)}</span>
            <span className="text-lg text-gray-500">{currency}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">inkl. MwSt.</p>

          <div className="mt-6 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-green-700 font-medium">Auf Lager</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-3 h-3 text-gray-500" />
              </div>
              <span className="text-sm text-gray-600">Versandbereit in 1–2 Werktagen</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Truck className="w-3 h-3 text-gray-500" />
              </div>
              <span className="text-sm text-gray-600">Versandkostenfrei ab 50 €</span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`mt-8 w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              added
                ? "bg-green-500 text-white"
                : "bg-brand-600 hover:bg-brand-700 text-white hover:shadow-md"
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Hinzugefügt!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                In den Warenkorb
              </>
            )}
          </button>
        </div>
      </div>

      {/* Beschreibung – sanitized */}
      {product.descriptionHtml && (
        <DescriptionBlock html={product.descriptionHtml} />
      )}
    </motion.div>
  );
}

function DescriptionBlock({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    import("dompurify").then((DOMPurify) => {
      if (ref.current) {
        ref.current.innerHTML = DOMPurify.default.sanitize(html);
      }
    });
  }, [html]);

  return (
    <div className="mt-10 md:mt-14">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Produktbeschreibung</h2>
        <div
          ref={ref}
          className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
        />
      </div>
    </div>
  );
}
