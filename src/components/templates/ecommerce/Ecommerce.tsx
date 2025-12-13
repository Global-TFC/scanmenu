"use client";
import { useMemo, useState, useEffect, useCallback, memo } from "react";
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
import Image from "next/image";
import FlashDeals from "./FlashDeals";
import OptimizedProductCard from "./OptimizedProductCard";
import OptimizedCart from "./OptimizedCart";
import { useProducts, Product } from "@/hooks/use-products";
import { motion, AnimatePresence } from "framer-motion";
import { FlashDealsErrorBoundary, ProductGridErrorBoundary } from "@/components/error-boundaries/ProductErrorBoundary";
import { AlertTriangle, RefreshCw } from "lucide-react";

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

  // Use our custom hook for data fetching with dual product management
  const {
    featuredProducts,
    featuredLoading,
    featuredError,
    regularProducts,
    regularLoading,
    regularError,
    hasMore,
    loadMoreRef,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    retryFeaturedProducts,
    retryRegularProducts,
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
  const canWhatsApp = Boolean(whatsappNumber && /\d/.test(whatsappNumber));
  const openWhatsApp = (message: string) => {
    if (!canWhatsApp) return;
    const url = `https://wa.me/${encodeURIComponent(
      whatsappNumber
    )}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const addToCart = useCallback((p: Product) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === p.id);
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { ...p, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id)), []);
  
  const updateQuantity = useCallback((id: string, quantity: number) =>
    setItems((prev) =>
      prev
        .map((it) =>
          it.id === id ? { ...it, quantity: Math.max(0, quantity) } : it
        )
        .filter((it) => it.quantity > 0)
    ), []);
  
  const clearCart = useCallback(() => setItems([]), []);
  
  const getTotalItems = useMemo(() => 
    items.reduce((sum, it) => sum + it.quantity, 0), [items]);
  
  const getTotalPrice = useMemo(() =>
    items.reduce((sum, it) => sum + it.price * it.quantity, 0), [items]);

  const orderViaWhatsApp = useCallback(() => {
    if (!canWhatsApp || items.length === 0) return;
    const orderItems = items
      .map(
        (it) =>
          `${it.name} x${it.quantity} - ₹${it.price * it.quantity}`
      )
      .join("\n");
    const message = `Hi I'd Like Order :\n\n${orderItems}\n\nTotal: ₹${getTotalPrice}`;
    openWhatsApp(message);
  }, [canWhatsApp, items, getTotalPrice, openWhatsApp]);

  // Products are now separated by the useProducts hook
  // No need to filter here - featuredProducts and regularProducts come pre-separated

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-[4px] border-black shadow-[0_4px_0_#000]">
        <div className="px-4 py-4">
          {/* Logo and Cart */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {shopLogo ? (
                <div className="w-12 h-12 border-[3px] border-black rotate-[-2deg] shadow-[3px_3px_0_#000] overflow-hidden bg-white relative">
                  <Image
                    src={shopLogo}
                    alt={shopName}
                    fill
                    sizes="48px"
                    className="object-cover rotate-[2deg]"
                    priority
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
              {getTotalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white w-6 h-6 border-[2px] border-black flex items-center justify-center p-0 text-xs font-black shadow-[2px_2px_0_#000]">
                  {getTotalItems}
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
              aria-label="Search products"
              role="searchbox"
              autoComplete="off"
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

      {/* Flash Deals - now uses pre-filtered featured products with error handling */}
      <FlashDealsErrorBoundary>
        {featuredError ? (
          <div className="py-6 bg-red-50 border-y-[4px] border-red-500 my-4">
            <div className="px-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500 border-[3px] border-black shadow-[3px_3px_0_#000] rotate-[-2deg] mb-4">
                <AlertTriangle className="text-white" size={20} />
              </div>
              <p className="text-red-800 text-sm font-bold uppercase mb-2">
                Failed to load flash deals
              </p>
              <button
                onClick={retryFeaturedProducts}
                className="inline-flex items-center gap-2 px-3 py-1 bg-red-500 text-white border-[2px] border-black font-black uppercase text-xs shadow-[2px_2px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        ) : featuredLoading ? (
          <div className="py-6 bg-[#fff7d6] border-y-[4px] border-black my-4">
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-black border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : featuredProducts.length > 0 ? (
           <FlashDeals products={featuredProducts} onAdd={addToCart} />
        ) : null}
      </FlashDealsErrorBoundary>

      {/* All Products */}
      <ProductGridErrorBoundary>
        <div className="px-4 py-6">
          <h2 className="text-3xl font-black mb-6 uppercase tracking-tight bg-yellow-300 border-[4px] border-black px-4 py-3 inline-block shadow-[6px_6px_0_#000] transform rotate-[-1deg]">
            All Products
          </h2>
          
          {regularError ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 border-[3px] border-black shadow-[3px_3px_0_#000] rotate-[-2deg] mb-4">
                <AlertTriangle className="text-white" size={28} />
              </div>
              <p className="text-red-800 text-lg font-black uppercase mb-2">
                Failed to load products
              </p>
              <p className="text-red-700 text-sm mb-4 font-bold uppercase">
                {regularError}
              </p>
              <button
                onClick={retryRegularProducts}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white border-[3px] border-black font-black uppercase shadow-[3px_3px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : regularProducts.length === 0 && !regularLoading ? (
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
                  <OptimizedProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
          
          {/* Infinite Scroll Trigger - now only for regular products */}
          {(hasMore || regularLoading) && !regularError && (
            <div 
               ref={loadMoreRef} 
               className="flex justify-center py-8"
            >
               {regularLoading && (
                 <div className="w-8 h-8 border-4 border-black border-t-yellow-300 rounded-full animate-spin"></div>
               )}
            </div>
          )}

        </div>
      </ProductGridErrorBoundary>

      {/* Footer */}
      <footer className="bg-yellow-300 border-t-[4px] border-black mt-12 py-8 shadow-[0_-4px_0_#000]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-black text-sm font-black uppercase">
            © {new Date().getFullYear()} {shopName}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Optimized Cart Sidebar */}
      <OptimizedCart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        totalItems={getTotalItems}
        totalPrice={getTotalPrice}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onClearCart={clearCart}
        onWhatsAppOrder={orderViaWhatsApp}
        canWhatsApp={canWhatsApp}
        isWhatsappOrderingEnabled={isWhatsappOrderingEnabled}
      />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Performance optimizations */
        .shadow-\\[4px_4px_0_\\#000\\],
        .shadow-\\[3px_3px_0_\\#000\\],
        .shadow-\\[6px_6px_0_\\#000\\] {
          will-change: transform, box-shadow;
          transform: translateZ(0);
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .transition-all,
          .hover\\:translate-x-\\[-2px\\],
          .hover\\:translate-y-\\[-2px\\],
          .hover\\:rotate-\\[0deg\\] {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
