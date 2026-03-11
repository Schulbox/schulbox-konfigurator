import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { useSchulbox } from "~/context/SchulboxContext";
import { motion } from "framer-motion";
import { Box, Check, ArrowLeft, Package, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getProductByHandle } from "~/lib/shopify.server";

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.handle) throw new Response("Kein Produkt", { status: 400 });
  const product = await getProductByHandle(params.handle);
  if (!product) throw new Response("Nicht gefunden", { status: 404 });
  return json(product);
}

export default function KonfiguratorDetailPage() {
  const product = useLoaderData<typeof loader>();
  const images = product.images.edges.map((e: any) => e.node);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const { addToBox, items } = useSchulbox();

  const isInBox = items.some((i) => i.id === product.id);
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const currency = product.priceRange.minVariantPrice.currencyCode === "EUR" ? "€" : product.priceRange.minVariantPrice.currencyCode;

  const handleAdd = () => {
    addToBox({
      id: product.id,
      title: product.title,
      quantity: 1,
      price,
      image: images[0]?.url || "",
      category: product.productType || "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-6 md:py-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to="/konfigurator" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Zurück zum Konfigurator
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Bilder */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
            {images.length > 0 ? (
              <div className="relative aspect-square flex items-center justify-center">
                <img src={images[activeImage]?.url} alt={images[activeImage]?.altText || product.title} className="max-h-full max-w-full object-contain" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)} className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-sm transition-all">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={() => setActiveImage((p) => (p + 1) % images.length)} className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-sm transition-all">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center"><Package className="w-16 h-16 text-gray-300" /></div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((img: any, i: number) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`flex-shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden transition-all ${activeImage === i ? "border-brand-500" : "border-gray-200 hover:border-gray-300"}`}>
                  <img src={img.url} alt="" className="w-full h-full object-contain" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{product.title}</h1>
          {product.productType && (
            <span className="inline-flex self-start items-center px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium mt-2">{product.productType}</span>
          )}

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{price.toFixed(2)}</span>
            <span className="text-lg text-gray-500">{currency}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">inkl. MwSt.</p>

          {isInBox && (
            <div className="mt-4 bg-brand-50 border border-brand-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <Check className="w-4 h-4 text-brand-600" />
              <span className="text-sm text-brand-700 font-medium">Bereits in deiner Schulbox</span>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={added}
            className={`mt-6 w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              added ? "bg-green-500 text-white" : "bg-gray-900 hover:bg-brand-600 text-white hover:shadow-md"
            }`}
          >
            {added ? (
              <><Check className="w-4 h-4" /> Hinzugefügt!</>
            ) : (
              <><Box className="w-4 h-4" /> {isInBox ? "Nochmal hinzufügen" : "In die Schulbox"}</>
            )}
          </button>
        </div>
      </div>

      {/* Beschreibung */}
      {product.descriptionHtml && (
        <div className="mt-10 md:mt-14">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Produktbeschreibung</h2>
            <div
              className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
