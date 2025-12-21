"use client";
import { useMemo, useState, useEffect } from "react";
import { Search, ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useProducts, Product } from "@/hooks/use-products";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem extends Product {
  quantity: number;
}

export default function Normal({
  shopName,
  shopPlace,
  shopContact,
  shopLogo,
  products: initialProducts,
  slug,
  themeConfig,
}: {
  shopName: string;
  shopPlace: string;
  shopContact: string;
  shopLogo?: string;
  products: Product[];
  slug: string;
  themeConfig?: any;
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const primaryColor = themeConfig?.primaryColor || "#000000";
  const backgroundColor = themeConfig?.backgroundColor || "#ffffff";
  const textColor = themeConfig?.textColor || "#000000";
  const fontFamily = themeConfig?.font === "Serif" ? "font-serif" : themeConfig?.font === "Monospace" ? "font-mono" : "font-sans";

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

  // Filter Products - Handled by hook now, but we use 'products' from hook directly.
  const filteredProducts = products;

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load Cart
  useEffect(() => {
    if (!shopName) return;
    try {
      const saved = sessionStorage.getItem(`cart_${shopName}`);
      if (saved) setCartItems(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, [shopName]);

  // Save Cart
  useEffect(() => {
    if (!shopName) return;
    sessionStorage.setItem(`cart_${shopName}`, JSON.stringify(cartItems));
  }, [cartItems, shopName]);

  // Cart Actions
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.offerPrice ?? item.price) * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const whatsappNumber = (shopContact || "").replace(/\s+/g, "");
  const canWhatsApp = whatsappNumber && /\d/.test(whatsappNumber);

  const checkout = () => {
    if (!canWhatsApp) return;
    const text = `*New Order from ${shopName}*\n\n${cartItems
      .map((item) => `${item.name} x${item.quantity} - ₹${(item.offerPrice ?? item.price) * item.quantity}`)
      .join("\n")}\n\n*Total: ₹${cartTotal}*`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div 
      className={`min-h-screen ${fontFamily} selection:bg-[var(--primary)] selection:text-white`}
      style={{ "--primary": primaryColor, "--background": backgroundColor, "--text": textColor } as React.CSSProperties}
    >
      <style>
        {`
          :root {
            --primary: ${primaryColor};
            --background: ${backgroundColor};
            --text: ${textColor};
          }
          body {
            background-color: var(--background);
            color: var(--text);
          }
          .bg-primary { background-color: var(--primary); }
          .text-primary { color: var(--primary); }
          .border-primary { border-color: var(--primary); }
          .bg-background { background-color: var(--background); }
          .text-text { color: var(--text); }
        `}
      </style>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? "bg-background/90 backdrop-blur-md border-b border-gray-100 py-3" : "bg-background py-5"}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {shopLogo && <img src={shopLogo} alt={shopName} className="w-8 h-8 object-cover rounded-full" />}
            <h1 className="text-xl font-bold tracking-tight uppercase text-text">{shopName}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setCartOpen(true)} className="relative p-2 hover:bg-gray-100 rounded-full transition-colors text-text">
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Search */}
      <div className="pt-24 pb-4 px-4 max-w-7xl mx-auto px-4">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search for dresses, shoes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-full py-3 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all border ${
                selectedCategory === cat ? "bg-primary text-white border-primary" : "bg-background text-text border-gray-200 hover:border-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-20">

        {filteredProducts.length === 0 && !loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-4">
             <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                key={product.id}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden rounded-lg mb-3">
                  <img src={product.image || "/default-product.png"} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {product.offerPrice && product.offerPrice > 0 && product.price && product.price > 0 && product.offerPrice < product.price && (
                    <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                      Sale
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    className="absolute bottom-3 right-3 bg-background text-text p-2.5 rounded-full shadow-lg translate-y-0 opacity-100 md:translate-y-12 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div>
                  <p className="text-xs opacity-70 uppercase tracking-wide mb-1 text-text">{product.category}</p>
                  <h3 className="text-sm font-medium text-text line-clamp-1 mb-1 group-hover:underline decoration-1 underline-offset-4">{product.name}</h3>
                  {((product.offerPrice && product.offerPrice > 0) || (product.price && product.price > 0)) ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text">₹{product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price}</span>
                      {product.offerPrice && product.offerPrice > 0 && product.price && product.price > 0 && product.offerPrice < product.price && (
                        <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                      )}
                    </div>
                  ) : null}
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
               <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
             )}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase tracking-wide">Shopping Bag ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                  <ShoppingBag size={48} strokeWidth={1} className="mb-4 opacity-20" />
                  <p>Your bag is empty.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 ml-2">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-full">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-gray-50 rounded-l-full"><Minus size={14} /></button>
                          <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-gray-50 rounded-r-full"><Plus size={14} /></button>
                        </div>
                        <span className="text-sm font-bold">₹{(item.offerPrice ?? item.price) * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-lg font-bold">₹{cartTotal}</span>
              </div>
              <button 
                onClick={checkout}
                disabled={cartItems.length === 0}
                className="w-full bg-primary text-white py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                Checkout on WhatsApp <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider">© 2025 {shopName}</p>
        </div>
      </footer>
    </div>
  );
}