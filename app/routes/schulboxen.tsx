import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { motion } from "framer-motion";
import { Package, ArrowRight, School, Heart } from "lucide-react";
import { getProducts } from "~/lib/shopify.server";

export async function loader() {
  const allProducts = await getProducts(100);
  // Nur Schulbox-Produkte
  const schulboxen = allProducts.filter(
    (p: any) => (p.tags || []).includes("schulbox")
  );
  return json({ schulboxen });
}

export default function SchulboxenPage() {
  const { schulboxen } = useLoaderData<typeof loader>();

  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.div
        className="bg-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Schulboxen</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Fertig zusammengestellte Schulboxen von Lehrkräften. Finde die Box deiner Schule und bestelle mit einem Klick.
          </p>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {schulboxen.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Noch keine Schulboxen verfügbar</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Schulboxen werden von Lehrkräften erstellt. Schau bald wieder vorbei!
            </p>
            <Link
              to="/webshop"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Einzelne Artikel im Shop
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {schulboxen.map((box: any, i: number) => {
              const price = parseFloat(box.priceRange.minVariantPrice.amount);
              const image = box.images.edges[0]?.node;

              return (
                <motion.div
                  key={box.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link
                    to={`/webshop/${box.handle}`}
                    className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                  >
                    <div className="relative bg-brand-50 p-6 aspect-[4/3] flex items-center justify-center">
                      {image?.url ? (
                        <img
                          src={image.url}
                          alt={image.altText || box.title}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="w-20 h-20 text-brand-200" />
                      )}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                        <School className="w-3.5 h-3.5 text-brand-600" />
                        <span className="text-xs font-medium text-brand-700">Schulbox</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors">
                        {box.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                        <Heart className="w-3 h-3 text-rose-400" />
                        Verpackt in geschützter Werkstätte
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-gray-900">{price.toFixed(2)}</span>
                          <span className="text-sm text-gray-400 ml-1">€</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-semibold group-hover:bg-brand-700 transition-colors">
                          Auswählen <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
