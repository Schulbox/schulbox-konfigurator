import { useLoaderData, Link, Outlet, useMatches, useOutletContext } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useState, useMemo, useEffect } from "react";
import { useSearch } from "~/context/SearchContext";
import { useSchulbox } from "~/context/SchulboxContext";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Check, Search, SlidersHorizontal, Package, ArrowRight, Plus, X, RefreshCw } from "lucide-react";
import { getProducts } from "~/lib/shopify.server";
import type { AlternativeProduct } from "~/context/SchulboxContext";

export async function loader() {
  const products = await getProducts(100);
  const categories = Array.from(
    new Set(products.map((p: any) => p.productType).filter(Boolean))
  ) as string[];
  return json({ products, categories });
}

export default function KonfiguratorSeite() {
  const { products, categories } = useLoaderData<typeof loader>();
  const { searchQuery, setSearchQuery } = useSearch();
  const [sortOption, setSortOption] = useState("standard");
  const [categoryFilter, setCategoryFilter] = useState("alle");
  const { addToBox, totalItems, justAdded, items: boxItems, setAlternatives } = useSchulbox();
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [altPickerFor, setAltPickerFor] = useState<string | null>(null);
  const [altSearch, setAltSearch] = useState("");

  const outletContext = useOutletContext<any>();
  const isTeacher = outletContext?.user?.role === "lehrkraft" || outletContext?.user?.role === "admin";

  const matches = useMatches();
  const isDetailPage = matches.some((m) => m.id?.includes("konfigurator.$handle"));

  if (isDetailPage) {
    return <Outlet />;
  }

  // Redirect wenn kein Lehrer
  if (!outletContext?.isLoading && !isTeacher) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Zugriff nur für Lehrkräfte</h2>
        <p className="text-gray-500 mb-6">Der Box-Konfigurator ist nur für freigeschaltete Lehrkräfte verfügbar.</p>
        <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">Einloggen</Link>
      </div>
    );
  }

  const filteredProducts = useMemo(() => {
    return products
      .filter((p: any) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = !query ||
          p.title.toLowerCase().includes(query) ||
          (p.tags || []).some((t: string) => t.toLowerCase().includes(query));
        const matchesCategory = categoryFilter === "alle" ||
          (p.productType || "").toLowerCase() === categoryFilter.toLowerCase();
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
  }, [products, searchQuery, categoryFilter, sortOption]);

  const handleAddToBox = (product: any) => {
    addToBox({
      id: product.id,
      title: product.title,
      quantity: 1,
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      image: product.images.edges[0]?.node.url || "",
      category: product.productType || "",
    });
    setClickedId(product.id);
    setTimeout(() => setClickedId(null), 1200);
  };

  const isInBox = (productId: string) => boxItems.some((i) => i.id === productId);
  const allCategories = [{ value: "alle", label: "Alle" }, ...categories.map((c) => ({ value: c, label: c }))];

  const altPickerItem = altPickerFor ? boxItems.find((i) => i.id === altPickerFor) : null;
  const altPickerProducts = useMemo(() => {
    if (!altPickerFor || !altPickerItem) return [];
    return products.filter((p: any) => {
      if (p.id === altPickerFor) return false;
      if ((p.tags || []).includes("schulbox")) return false;
      // Match by category or search
      const q = altSearch.toLowerCase();
      if (q) {
        return p.title.toLowerCase().includes(q) ||
          (p.productType || "").toLowerCase().includes(q);
      }
      return (p.productType || "") === (altPickerItem.category || "");
    });
  }, [altPickerFor, altPickerItem, products, altSearch]);

  const currentAlts = altPickerItem?.alternatives || [];
  const isAltSelected = (productId: string) => currentAlts.some((a) => a.id === productId);

  const toggleAlt = (product: any) => {
    if (!altPickerFor) return;
    const alt: AlternativeProduct = {
      id: product.id,
      title: product.title,
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      image: product.images.edges[0]?.node.url || "",
    };
    const existing = currentAlts;
    if (isAltSelected(product.id)) {
      setAlternatives(altPickerFor, existing.filter((a) => a.id !== product.id));
    } else {
      setAlternatives(altPickerFor, [...existing, alt]);
    }
  };

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
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Box Konfigurator</h1>
              <p className="text-gray-400 text-sm mt-1">Stelle eine Schulbox für deine Klasse zusammen</p>
            </div>
            <Link
              to="/schulboxcart"
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md"
            >
              <Box className="w-4 h-4" />
              <span>Schulbox</span>
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: justAdded ? [1, 1.4, 1] : 1 }}
                  className="bg-white text-brand-700 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                >
                  {totalItems}
                </motion.span>
              )}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Kategorien */}
          <div className="flex flex-wrap gap-2 mt-5 mb-4">
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

          {/* Sortierung */}
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
            <div className="flex gap-1.5">
              {[
                { value: "standard", label: "Standard" },
                { value: "preis-auf", label: "Preis ↑" },
                { value: "preis-ab", label: "Preis ↓" },
                { value: "az", label: "A–Z" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortOption(opt.value)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    sortOption === opt.value ? "bg-gray-700 text-white" : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-gray-500">{filteredProducts.length} Produkte</span>
          </div>
        </div>
      </motion.div>

      {/* Produktgrid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Keine Produkte gefunden</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product: any, i: number) => {
              const price = parseFloat(product.priceRange.minVariantPrice.amount);
              const inBox = isInBox(product.id);
              const image = product.images.edges[0]?.node;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.2) }}
                  className={`group bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col ${
                    inBox ? "border-brand-300 ring-1 ring-brand-200" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <Link to={`/konfigurator/${product.handle}`} className="block">
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
                      {inBox && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h2 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 mb-2">{product.title}</h2>
                    <div className="mt-auto pt-2">
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-base font-bold text-gray-900">{price.toFixed(2)}</span>
                        <span className="text-xs text-gray-400">€</span>
                      </div>
                      <div className="flex gap-1.5">
                        <motion.button
                          onClick={() => handleAddToBox(product)}
                          whileTap={{ scale: 0.9 }}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                            clickedId === product.id || inBox
                              ? "bg-brand-600 text-white shadow-md"
                              : "bg-gray-900 text-white hover:bg-brand-600 hover:shadow-md"
                          }`}
                        >
                          {clickedId === product.id ? (
                            <><Check className="w-3.5 h-3.5" /> Hinzugefügt</>
                          ) : inBox ? (
                            <><Plus className="w-3.5 h-3.5" /> Nochmal</>
                          ) : (
                            <><Box className="w-3.5 h-3.5" /> In die Box</>
                          )}
                        </motion.button>
                        {inBox && (
                          <button
                            onClick={() => { setAltPickerFor(product.id); setAltSearch(""); }}
                            className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent-50 text-accent-600 hover:bg-accent-100 transition-colors"
                            title="Alternativen zuweisen"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {inBox && boxItems.find((b) => b.id === product.id)?.alternatives?.length ? (
                        <p className="text-[10px] text-accent-600 mt-1 text-center">
                          {boxItems.find((b) => b.id === product.id)!.alternatives!.length} Alternative(n)
                        </p>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alternative Picker Modal */}
      <AnimatePresence>
        {altPickerFor && altPickerItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setAltPickerFor(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Alternativen zuweisen</h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">für „{altPickerItem.title}"</p>
                </div>
                <button
                  onClick={() => setAltPickerFor(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Search */}
              <div className="px-5 py-3 border-b border-gray-50 flex-shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Produkte durchsuchen..."
                    value={altSearch}
                    onChange={(e) => setAltSearch(e.target.value)}
                    className="bg-transparent border-none text-sm w-full focus:outline-none placeholder-gray-400"
                  />
                </div>
                {currentAlts.length > 0 && (
                  <p className="text-[10px] text-accent-600 mt-2">
                    {currentAlts.length} Alternative(n) ausgewählt
                  </p>
                )}
              </div>

              {/* Product List */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
                {altPickerProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {altSearch ? "Keine Produkte gefunden" : "Keine passenden Produkte in dieser Kategorie"}
                    </p>
                  </div>
                ) : (
                  altPickerProducts.map((product: any) => {
                    const price = parseFloat(product.priceRange.minVariantPrice.amount);
                    const image = product.images.edges[0]?.node?.url;
                    const selected = isAltSelected(product.id);
                    return (
                      <button
                        key={product.id}
                        onClick={() => toggleAlt(product)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          selected
                            ? "border-accent-300 bg-accent-50 ring-1 ring-accent-200"
                            : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {image ? (
                            <img src={image} alt={product.title} className="w-full h-full object-contain p-0.5" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 line-clamp-1">{product.title}</p>
                          <p className="text-[10px] text-gray-400">{price.toFixed(2)} €</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          selected ? "border-accent-500 bg-accent-500" : "border-gray-300"
                        }`}>
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={() => setAltPickerFor(null)}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
                >
                  Fertig ({currentAlts.length} Alternative{currentAlts.length !== 1 ? "n" : ""})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
