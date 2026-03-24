import { useLoaderData, Link, Outlet, useMatches, useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "~/context/CartContext";
import { useSearch } from "~/context/SearchContext";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ArrowLeft, Check, Search, Package, SlidersHorizontal, X } from "lucide-react";
import { getProducts } from "~/lib/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const products = await getProducts(100);

  // Kategorien aus productType extrahieren
  const categories = Array.from(
    new Set(products.map((p: any) => p.productType).filter(Boolean))
  ) as string[];

  return json({ products, categories });
}

export default function Webshop() {
  const { products, categories } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const { searchQuery, setSearchQuery } = useSearch();
  const [sortOption, setSortOption] = useState("standard");
  const [categoryFilter, setCategoryFilter] = useState("alle");
  const { addToCart } = useCart();
  const [clickedId, setClickedId] = useState<string | null>(null);

  // URL query parameter übernehmen
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams, setSearchQuery]);

  const matches = useMatches();
  const isDetailPage = matches.some((m) => m.id?.includes("webshop.$handle"));

  const filteredProducts = useMemo(() => {
    if (isDetailPage) return [];
    return products
      .filter((p: any) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = !query ||
          p.title.toLowerCase().includes(query) ||
          (p.tags || []).some((t: string) => t.toLowerCase().includes(query)) ||
          (p.productType || "").toLowerCase().includes(query);
        const matchesCategory = categoryFilter === "alle" ||
          (p.productType || "").toLowerCase() === categoryFilter.toLowerCase();
        // Schulboxen nicht im normalen Shop zeigen (eigene Seite)
        const isSchulbox = (p.tags || []).includes("schulbox");
        return matchesSearch && matchesCategory && !isSchulbox;
      })
      .sort((a: any, b: any) => {
        const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
        const priceB = parseFloat(b.priceRange.minVariantPrice.amount);
        if (sortOption === "preis-auf") return priceA - priceB;
        if (sortOption === "preis-ab") return priceB - priceA;
        if (sortOption === "az") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [products, searchQuery, categoryFilter, sortOption, isDetailPage]);

  if (isDetailPage) {
    return <Outlet />;
  }

  const handleAddToCart = (product: any) => {
    const variantId = product.variants?.edges?.[0]?.node?.id;
    if (!variantId) return;
    addToCart({
      id: product.id,
      variantId,
      title: product.title,
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      image: product.images.edges[0]?.node.url || "",
      quantity: 1,
    });
    setClickedId(product.id);
    setTimeout(() => setClickedId(null), 1200);
  };

  const allCategories = [{ value: "alle", label: "Alle Produkte" }, ...categories.map((c) => ({ value: c, label: c }))];
  const sortOptions = [
    { value: "standard", label: "Empfohlen" },
    { value: "preis-auf", label: "Preis aufsteigend" },
    { value: "preis-ab", label: "Preis absteigend" },
    { value: "az", label: "A – Z" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.div
        className="bg-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Shop</h1>
          <p className="text-gray-400 text-sm mb-5">Schulmaterialien einzeln bestellen</p>

          {/* Kategorien */}
          <div className="flex flex-wrap gap-2 mb-4">
            {allCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  categoryFilter === cat.value
                    ? "bg-brand-500 text-white shadow-sm"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sortierung + Anzahl */}
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
            <div className="flex gap-1.5">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortOption(opt.value)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    sortOption === opt.value
                      ? "bg-gray-700 text-white"
                      : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-gray-500">{filteredProducts.length} Produkte</span>
          </div>

          {/* Aktive Suche anzeigen */}
          {searchQuery && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-400">Suche:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-800 rounded-full text-xs text-white">
                "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Produktgrid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Keine Produkte gefunden</p>
            <p className="text-gray-400 text-sm mt-1">Versuche einen anderen Suchbegriff oder Kategorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product: any, i: number) => {
                const price = parseFloat(product.priceRange.minVariantPrice.amount);
                const currency = product.priceRange.minVariantPrice.currencyCode === "EUR" ? "€" : product.priceRange.minVariantPrice.currencyCode;
                const image = product.images.edges[0]?.node;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.2) }}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 flex flex-col"
                  >
                    <Link to={`/webshop/${product.handle}`} className="block">
                      <div className="relative bg-gray-50 p-3 aspect-square flex items-center justify-center overflow-hidden">
                        {image?.url ? (
                          <img
                            src={image.url}
                            alt={image.altText || product.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-gray-300" />
                        )}
                      </div>
                    </Link>

                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                      <Link to={`/webshop/${product.handle}`}>
                        <h2 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors">
                          {product.title}
                        </h2>
                      </Link>

                      <div className="mt-auto pt-2 flex items-end justify-between gap-2">
                        <div>
                          <span className="text-base sm:text-lg font-bold text-gray-900">{price.toFixed(2)}</span>
                          <span className="text-xs sm:text-sm text-gray-400 ml-1">{currency}</span>
                        </div>

                        <motion.button
                          onClick={() => handleAddToCart(product)}
                          whileTap={{ scale: 0.9 }}
                          className={`flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                            clickedId === product.id
                              ? "bg-brand-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-brand-600 hover:text-white hover:shadow-md"
                          }`}
                        >
                          {clickedId === product.id ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <ShoppingCart className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {clickedId === product.id ? "Hinzugefügt" : "Warenkorb"}
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
