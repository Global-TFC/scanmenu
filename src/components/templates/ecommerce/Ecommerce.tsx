"use client";
import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Grid3x3,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  Apple,
  Leaf,
  Milk,
} from "lucide-react";
import FlashDeals from "./FlashDeals";
import { useProducts, Product } from "@/hooks/use-products";
import { motion, AnimatePresence } from "framer-motion";

export default function Ecommerce({
  shopName,
  shopPlace,
  shopContact,
  shopLogo,
  products: initialProducts,
  isWhatsappOrderingEnabled = true,
  slug,
}: {
  shopName: string;
  shopPlace: string;
  shopContact: string;
  shopLogo?: string;
  products: Product[];
  isWhatsappOrderingEnabled?: boolean;
  slug: string;
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const [items, setItems] = useState<(Product & { quantity: number })[]>([]);
  const [loadedShopName, setLoadedShopName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Use our custom hook for data fetching
  const {
    products,
    loading,
    hasMore,
    loadMoreRef,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
  } = useProducts({ initialProducts, slug });

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    All: Grid3x3,
    Fruits: Apple,
    Vegetables: Leaf,
    Dairy: Milk,
    // Add more defaults or dynamic icon mapping if needed
  };

  // Load cart from session storage
  useEffect(() => {
    if (!shopName) return;
    try {
      const saved = sessionStorage.getItem(`cart_${shopName}`);
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error("Failed to load cart", e);
      setItems([]);
    } finally {
      setLoadedShopName(shopName);
    }
  }, [shopName]);

  // Save cart to session storage
  useEffect(() => {
    if (loadedShopName !== shopName || !shopName) return;
    try {
      sessionStorage.setItem(`cart_${shopName}`, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [items, shopName, loadedShopName]);

  const whatsappNumber = (shopContact || "").replace(/\s+/g, "");
  const canWhatsApp = whatsappNumber && /\d/.test(whatsappNumber);
  const openWhatsApp = (message: string) => {
    if (!canWhatsApp) return;
    const url = `https://wa.me/${encodeURIComponent(
      whatsappNumber
    )}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const addToCart = (p: Product) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === p.id);
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));
  const updateQuantity = (id: string, quantity: number) =>
    setItems((prev) =>
      prev
        .map((it) =>
          it.id === id ? { ...it, quantity: Math.max(0, quantity) } : it
        )
        .filter((it) => it.quantity > 0)
    );
  const clearCart = () => setItems([]);
  const getTotalItems = () => items.reduce((sum, it) => sum + it.quantity, 0);
  const getTotalPrice = () =>
    items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const orderViaWhatsApp = () => {
    if (!canWhatsApp || items.length === 0) return;
    const orderItems = items
      .map(
        (it) =>
          `${it.name} x${it.quantity} - ₹${it.price * it.quantity}`
      )
      .join("\n");
    const message = `Hi I'd Like Order :\n\n${orderItems}\n\nTotal: ₹${getTotalPrice()}`;
    openWhatsApp(message);
  };

  // Separate featured products for Flash Deals?
  // Current logic: FlashDeals uses 'regular' products passed in. 
  // In new logic, `products` contains everything from server.
  // We can filter `products` for isFeatured here if we want to show Flash Deals from the CURRENT batch,
  // OR we might want to fetch featured specifically. 
  // For simplicity, let's use the current `products` list. 
  // Note: Server sorts by createdAt desc. 
  const regularProducts = products.filter((p) => !p.isFeatured);
  const featuredProducts = products.filter((p) => p.isFeatured);

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-[4px] border-black shadow-[0_4px_0_#000]">
        <div className="px-4 py-4">
          {/* Logo and Cart */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {shopLogo ? (
                <div className="w-12 h-12 border-[3px] border-black rotate-[-2deg] shadow-[3px_3px_0_#000] overflow-hidden bg-white">
                  <img
                    src={shopLogo}
                    alt={shopName}
                    className="w-full h-full object-cover rotate-[2deg]"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-black border-[3px] border-black rotate-[-2deg] flex items-center justify-center shadow-[3px_3px_0_#000]">
                  <span className="text-white font-black text-2xl rotate-[2deg]">
                    {String(shopName || "S")[0]}
                  </span>
                </div>
              )}
              <span className="font-black text-2xl uppercase tracking-tight transform rotate-[-1deg]">
                {shopName || "Shop"}
              </span>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative bg-yellow-300 border-[3px] border-black p-2 shadow-[3px_3px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
            >
              <ShoppingCart className="w-6 h-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white w-6 h-6 border-[2px] border-black flex items-center justify-center p-0 text-xs font-black shadow-[2px_2px_0_#000]">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black z-10" />
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border-[3px] border-black font-bold uppercase text-sm placeholder:text-gray-500 shadow-[4px_4px_0_#000] focus:outline-none focus:shadow-[2px_2px_0_#000] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
            />
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="px-4 py-4">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {categories.map((cat, idx) => {
            const Icon = categoryIcons[cat] || Grid3x3;
            const rotations = [
              "rotate-[-1deg]",
              "rotate-[1deg]",
              "rotate-[-0.5deg]",
              "rotate-[0.5deg]",
            ];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-5 py-3 whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-black text-white"
                    : "bg-white text-black"
                } border-[3px] border-black font-black uppercase text-xs shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] ${
                  rotations[idx % rotations.length]
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-black">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Flash Deals */}
      {/* We pass the filtered list, but FlashDeals component usage might need check if it filters internally again? 
          Assuming FlashDeals just displays what is passed. */}
      {featuredProducts.length > 0 && (
         <FlashDeals products={featuredProducts} onAdd={addToCart} />
      )}

      {/* All Products */}
      <div className="px-4 py-6">
        <h2 className="text-3xl font-black mb-6 uppercase tracking-tight bg-yellow-300 border-[4px] border-black px-4 py-3 inline-block shadow-[6px_6px_0_#000] transform rotate-[-1deg]">
          All Products
        </h2>
        {regularProducts.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-300 border-[3px] border-black shadow-[3px_3px_0_#000] rotate-[-2deg] mb-4">
              <Search className="text-black" size={28} />
            </div>
            <p className="text-black text-lg font-black uppercase">
              No products found
            </p>
            <p className="text-gray-700 text-sm mt-1 font-bold uppercase">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-3 md:gap-3 lg:gap-3 max-w-[360px] mx-auto sm:max-w-none sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            <AnimatePresence mode="popLayout">
            {regularProducts.map((product, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={product.id}
                className="w-full max-w-[160px] sm:max-w-none mx-auto"
              >
                <div className="bg-white border-[3px] border-black p-3 shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all transform rotate-[-0.5deg] hover:rotate-[0deg]">
                  {/* Image Container */}
                  <div className="relative aspect-square border-[3px] border-black overflow-hidden mb-3">
                    <img
                      src={product.image || "/default-product.png"}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    {(() => {
                      const d =
                        typeof product.offerPrice === "number" &&
                        product.offerPrice < product.price
                          ? Math.round(
                              ((product.price - product.offerPrice) /
                                product.price) * 100
                            )
                          : 0;
                      return d > 0 ? (
                        <div className="absolute top-2 left-2 bg-red-600 text-white font-black text-xs px-2 py-1 uppercase border-[2px] border-black shadow-[2px_2px_0_#000] rotate-[-3deg]">
                          -{d}%
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Product Info */}
                  <div>
                    <h3 className="font-black text-sm mb-1 line-clamp-2 uppercase">
                      {product.name}
                    </h3>
                    <p className="text-xs font-bold text-gray-700 mb-2 uppercase">
                      {product.description.substring(0, 20)}
                    </p>

                    {/* Price and Add Button */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-lg">
                            ₹{(product.offerPrice ?? product.price).toFixed(0)}
                          </span>
                          {typeof product.offerPrice === "number" ? (
                            <span className="text-xs font-bold text-gray-500 line-through">
                              ₹{product.price.toFixed(0)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="w-9 h-9 bg-black text-white border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all rotate-[3deg] hover:rotate-[0deg]"
                      >
                        <Plus className="w-5 h-5 font-black" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Infinite Scroll Trigger */}
        {(hasMore || loading) && (
          <div 
             ref={loadMoreRef} 
             className="flex justify-center py-8"
          >
             {loading && (
               <div className="w-8 h-8 border-4 border-black border-t-yellow-300 rounded-full animate-spin"></div>
             )}
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="bg-yellow-300 border-t-[4px] border-black mt-12 py-8 shadow-[0_-4px_0_#000]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-black text-sm font-black uppercase">
            © {new Date().getFullYear()} {shopName}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setCartOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[380px] md:w-[420px] bg-white border-l-[4px] border-black shadow-[0_0_0_4px_#000]">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b-[4px] border-black flex items-center justify-between bg-yellow-200 shadow-[0_4px_0_#000]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-[3px] border-black shadow-[3px_3px_0_#000] rotate-[-2deg]">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-black text-xl font-black uppercase">
                      Cart
                    </div>
                    <div className="text-black font-bold text-xs">
                      {getTotalItems()} item{getTotalItems() !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 bg-white border-[3px] border-black shadow-[3px_3px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 bg-white border-[3px] border-black flex items-center justify-center mb-4 shadow-[4px_4px_0_#000]">
                      <ShoppingCart className="w-8 h-8 text-black" />
                    </div>
                    <div className="text-black text-lg font-black uppercase mb-2">
                      Your cart is empty
                    </div>
                    <div className="text-gray-700 text-xs font-bold uppercase">
                      Add products to get started
                    </div>
                  </div>
                ) : (
                  items.map((it) => (
                    <div
                      key={it.id}
                      className="flex gap-3 p-3 bg-white border-[3px] border-black shadow-[4px_4px_0_#000]"
                    >
                      <div className="relative w-16 h-16 border-[3px] border-black overflow-hidden">
                        <img
                          src={it.image || "/default-product.png"}
                          alt={it.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-black truncate uppercase">
                          {it.name}
                        </div>
                        <div className="text-xs text-gray-700 font-bold uppercase">
                          ₹{it.price}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeFromCart(it.id)}
                          className="p-1 bg-white border-[3px] border-black shadow-[3px_3px_0_#000]"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(it.id, it.quantity - 1)
                            }
                            className="w-8 h-8 bg-white border-[3px] border-black shadow-[3px_3px_0_#000] flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 text-black" />
                          </button>
                          <span className="w-8 text-center font-black text-black">
                            {it.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(it.id, it.quantity + 1)
                            }
                            className="w-8 h-8 bg-white border-[3px] border-black shadow-[3px_3px_0_#000] flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 text-black" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {items.length > 0 && (
                <div className="border-t-[4px] border-black p-4 space-y-3 bg-yellow-100 shadow-[0_-4px_0_#000]">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-black uppercase">
                      Total
                    </span>
                    <span className="text-xl font-black text-black">
                      ₹{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={clearCart}
                      className="flex-1 py-2 bg-white border-[3px] border-black font-black uppercase shadow-[3px_3px_0_#000]"
                    >
                      Clear Cart
                    </button>
                    {isWhatsappOrderingEnabled && canWhatsApp ? (
                      <button
                        onClick={orderViaWhatsApp}
                        className="flex-1 py-2 bg-green-500 border-[3px] border-black font-black uppercase shadow-[3px_3px_0_#000] hover:bg-green-600"
                      >
                        WhatsApp Order
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 py-2 bg-gray-400 border-[3px] border-black font-black uppercase shadow-[3px_3px_0_#000] cursor-not-allowed opacity-50 text-white text-xs"
                      >
                        {!isWhatsappOrderingEnabled ? "WhatsApp Disabled" : "No WhatsApp"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
