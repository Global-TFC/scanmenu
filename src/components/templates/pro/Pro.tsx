"use client";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  MessageCircle,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useProducts, Product } from "@/hooks/use-products";



export default function Pro({
  shopName,
  shopPlace,
  shopContact,
  shopLogo,
  products: initialProducts,
  isWhatsappOrderingEnabled = true,
  slug,
  themeConfig,
}: {
  shopName: string;
  shopPlace: string;
  shopContact: string;
  shopLogo?: string;
  products: Product[];
  isWhatsappOrderingEnabled?: boolean;
  slug: string;
  themeConfig?: any;
}) {
  const primaryColor = themeConfig?.primaryColor || '#0f172a';
  const backgroundColor = themeConfig?.backgroundColor || '#e0e0e0';
  const textColor = themeConfig?.textColor || '#000000';
  const accentColor = themeConfig?.primaryColor || '#8b7355'; // Using primary for accent in Pro theme
  const fontFamily = themeConfig?.font === 'Serif' ? 'font-serif' : themeConfig?.font === 'Monospace' ? 'font-mono' : 'font-sans';

  const [showWhatsAppFloat, setShowWhatsAppFloat] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [items, setItems] = useState<(Product & { quantity: number })[]>([]);
  const [isGlass, setIsGlass] = useState(false);
  const [loadedShopName, setLoadedShopName] = useState<string | null>(null);

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
  
  // Direct use of products from hook
  const filteredProducts = products;

  useEffect(() => {
    const onScroll = () => setShowWhatsAppFloat(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.id === id ? { ...it, quantity: Math.max(0, quantity) } : it
        )
        .filter((it) => it.quantity > 0)
    );
  };

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

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${fontFamily} bg-[var(--background)]`}
      style={{ '--accent': accentColor, '--background': backgroundColor, '--text': textColor } as React.CSSProperties}
    >
      <style>{`
        :root {
          --accent: ${accentColor};
          --background: ${backgroundColor};
          --text: ${textColor};
        }
        body {
          background-color: var(--background);
          color: var(--text);
        }
        .text-accent { color: var(--accent) !important; }
        .bg-accent { background-color: var(--accent) !important; }
        .text-text { color: var(--text) !important; }
      `}</style>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-2">
        <div
          className={`max-w-7xl mx-auto rounded-full flex items-center justify-between gap-4 px-4 sm:px-6 py-2 transition-all duration-300 ${
            isGlass
              ? "bg-white/30 backdrop-blur-md border border-white/20 shadow-lg"
              : "bg-[var(--background)]"
          }`}
          style={
            isGlass
              ? {}
              : { border: "1px solid rgba(0,0,0,0.06)" }
          }
        >
          <Link href="#top" className="flex items-center gap-2 shrink-0">
            {shopLogo ? (
              <img
                src={shopLogo}
                alt={shopName}
                className="w-8 h-8 rounded-full object-cover"
                style={
                  isGlass
                    ? { border: "1px solid rgba(255,255,255,0.2)" }
                    : {
                        boxShadow:
                          "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
                      }
                }
              />
            ) : (
              <span
                className={`inline-block w-7 h-7 rounded-full ${
                  isGlass ? "bg-white/50" : "bg-[#e0e0e0]"
                }`}
                style={
                  isGlass
                    ? {}
                    : {
                        boxShadow:
                          "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
                      }
                }
                aria-hidden
              />
            )}
            <span
              className={`font-semibold tracking-tight ${
                isGlass ? "text-white" : "text-[#3a3a3a]"
              }`}
            >
              {shopName || "Shop"}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGlass(!isGlass)}
              className={`p-2 rounded-full transition-all duration-300 ${
                isGlass
                  ? "bg-white/30 text-white hover:bg-white/40"
                  : "bg-[#e0e0e0] text-[#3a3a3a]"
              }`}
              style={
                isGlass
                  ? {}
                  : {
                      boxShadow:
                        "5px 5px 10px #bebebe, -5px -5px 10px #ffffff",
                    }
              }
              title="Toggle Glassmorphism"
            >
              {isGlass ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className={`relative px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                isGlass
                  ? "bg-white/30 backdrop-blur-md border border-white/20 shadow-lg text-white hover:bg-white/40"
                  : "bg-[#e0e0e0] text-[#3a3a3a]"
              }`}
              style={
                isGlass
                  ? {}
                  : {
                      boxShadow:
                        "inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff",
                    }
              }
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                {getTotalItems() > 0 && (
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-xs bg-[var(--accent)] text-white"
                    style={{
                      boxShadow: "2px 2px 4px #bebebe, -2px -2px 4px #ffffff",
                    }}
                  >
                    {getTotalItems()}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <section id="products" className="py-8">

          <div className="text-center mt-8 mb-10">
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 md:px-8 md:py-4 rounded-2xl transition-all duration-300 font-medium ${
                    isGlass
                      ? `backdrop-blur-md border border-white/20 shadow-lg ${
                          selectedCategory === category
                            ? "bg-white/40 text-white"
                            : "bg-white/20 text-white/80 hover:bg-white/30"
                        }`
                      : `bg-[#e0e0e0] ${
                          selectedCategory === category
                            ? "text-[#3a3a3a]"
                            : "text-[#6a6a6a]"
                        }`
                  }`}
                  style={
                    isGlass
                      ? {}
                      : {
                          boxShadow:
                            selectedCategory === category
                              ? "inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff"
                              : "6px 6px 12px #bebebe, -6px -6px 12px #ffffff",
                        }
                  }
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="max-w-xl mx-auto mb-6">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent shadow-sm transition-all duration-300 ${
                    isGlass
                      ? "bg-white/20 backdrop-blur-md border border-white/20 text-white placeholder-white/60"
                      : "bg-[#eaeaea] border border-[#dcdcdc] text-[#3a3a3a]"
                  }`}
                />
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 && !loading ? (
            <div className="text-center py-16">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  isGlass
                    ? "bg-white/20 backdrop-blur-md border border-white/20 shadow-lg"
                    : "bg-[#e0e0e0]"
                }`}
                style={
                  isGlass
                    ? {}
                    : {
                        boxShadow:
                          "inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff",
                      }
                }
              >
                <Search className="text-[#6a6a6a]" size={32} />
              </div>
              <p className="text-[#6a6a6a] text-lg font-medium">
                No items found
              </p>
              <p className="text-[#9a9a9a] text-sm mt-1">
                Try adjusting your search
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div // We can't use Framer Motion easily with replace_file_content if we don't import it. I need to add import. 
                  // I'll skip Framer Motion here for simplicity in this large replacement OR I'll add the import in a separate call?
                  // Wait, I am replacing the WHOLE function, but NOT the imports.
                  // I MUST add imports first or use multi_replace.
                  // `replace_file_content` targets lines.
                  // I am replacing lines 29-482. Imports are lines 1-15.
                  // So I can't add imports in this call.
                  // I'll proceed without Framer Motion for Pro in this step, or I'll just use standard div and add imports later.
                  // Let's just use standard div for now to get infinite scroll working, and maybe add animation in a second pass if really needed,
                  // or I should have used multi_replace.
                  // Actually, I can use `multi_replace` to add import AND replace body. 
                  // But I am already committed to this tool call.
                  // I will just use standard divs here.
                  key={product.id}
                  className={`group rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] ${
                    isGlass
                      ? "bg-white/20 backdrop-blur-md border border-white/20 shadow-lg"
                      : "bg-[#e0e0e0]"
                  }`}
                  style={
                    isGlass
                      ? {}
                      : {
                          boxShadow:
                            "16px 16px 32px #bebebe, -16px -16px 32px #ffffff",
                        }
                  }
                >
                  <div className="relative overflow-hidden h-72">
                    <img
                      src={product.image || "/default-product.png"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        isGlass ? "text-white" : "text-[#3a3a3a]"
                      }`}
                    >
                      {product.name}
                    </h3>
                    <p
                      className={`mb-4 leading-relaxed ${
                        isGlass ? "text-white/80" : "text-[#6a6a6a]"
                      }`}
                    >
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            {((product.offerPrice && product.offerPrice > 0) || (product.price && product.price > 0)) ? (
                              <>
                                <span
                                  className={`text-3xl font-bold ${
                                    isGlass ? "text-white" : "text-[#3a3a3a]"
                                  }`}
                                >
                                  ₹{product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price}
                                </span>
                                {typeof product.offerPrice === "number" && product.offerPrice > 0 && product.price && product.price > 0 && product.offerPrice < product.price && (
                                  <>
                                    <span className="text-lg text-[#8a8a8a] line-through">
                                      ₹{product.price}
                                    </span>
                                    <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                      {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF
                                    </span>
                                  </>
                                )}
                              </>
                            ) : null}
                          </div>
                        </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToCart(product)}
                          className={`p-4 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                            isGlass
                              ? "bg-white/70 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/40"
                              : "bg-[#e0e0e0]"
                          }`}
                          style={
                            isGlass
                              ? {}
                              : {
                                  boxShadow:
                                    "6px 6px 12px #bebebe, -6px -6px 12px #ffffff",
                                }
                          }
                        >
                          <ShoppingCart className="w-6 h-6 text-[var(--accent)]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
           {/* Infinite Scroll Trigger */}
        {(hasMore || loading) && (
          <div 
             ref={loadMoreRef} 
             className="flex justify-center py-8"
          >
             {loading && (
               <div className={`w-8 h-8 rounded-full border-4 animate-spin ${isGlass ? "border-white border-t-transparent" : "border-[var(--accent)] border-t-transparent"}`}></div>
             )}
          </div>
        )}

        </section>
      </main>

      <footer className="bg-[#2a2a2a] text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-300 text-sm">
            © {new Date().getFullYear()} {shopName || "Shop"}. All rights
            reserved.
          </p>
        </div>
      </footer>

      {canWhatsApp && showWhatsAppFloat && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
          <button
            onClick={() => openWhatsApp("Hello! I'd like to place an order")}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
              isGlass
                ? "bg-white/30 backdrop-blur-md border border-white/20 shadow-lg"
                : "bg-[#e0e0e0]"
            }`}
            style={
              isGlass
                ? {}
                : {
                    boxShadow:
                      "10px 10px 20px #bebebe, -10px -10px 20px #ffffff",
                  }
            }
            aria-label="Order via WhatsApp"
          >
            <MessageCircle className="w-8 h-8 text-[#25D366]" />
          </button>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setCartOpen(false)}
          />
          <div
            className={`absolute right-0 top-0 h-full w-[400px] sm:w-[540px] shadow-xl transition-colors duration-300 ${
              isGlass
                ? "bg-white/20 backdrop-blur-xl border-l border-white/20"
                : "bg-[#e0e0e0]"
            }`}
            style={
              isGlass ? {} : { boxShadow: "-8px 0 24px rgba(0,0,0,0.15)" }
            }
          >
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-[#d0d0d0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isGlass
                        ? "bg-white/30 backdrop-blur-md border border-white/20"
                        : "bg-[#e0e0e0]"
                    }`}
                    style={
                      isGlass
                        ? {}
                        : {
                            boxShadow:
                              "inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff",
                          }
                    }
                  >
                    <ShoppingCart className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <div
                      className={`text-xl font-semibold ${
                        isGlass ? "text-white" : "text-[#3a3a3a]"
                      }`}
                    >
                      Shopping Cart
                    </div>
                    <div
                      className={`${
                        isGlass ? "text-white/80" : "text-[#6a6a6a]"
                      }`}
                    >
                      {getTotalItems()} item{getTotalItems() !== 1 ? "s" : ""}{" "}
                      in your cart
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className={`p-2 rounded-full ${
                    isGlass
                      ? "bg-white/30 hover:bg-white/40 text-white"
                      : "bg-[#e0e0e0]"
                  }`}
                  style={
                    isGlass
                      ? {}
                      : {
                          boxShadow:
                            "2px 2px 4px #bebebe, -2px -2px 4px #ffffff",
                        }
                  }
                >
                  <X className="w-4 h-4 text-[#6a6a6a]" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                        isGlass
                          ? "bg-white/30 backdrop-blur-md border border-white/20"
                          : "bg-[#e0e0e0]"
                      }`}
                      style={
                        isGlass
                          ? {}
                          : {
                              boxShadow:
                                "inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff",
                            }
                      }
                    >
                      <ShoppingCart className="w-8 h-8 text-[var(--accent)]" />
                    </div>
                    <div
                      className={`text-lg font-semibold mb-2 ${
                        isGlass ? "text-white" : "text-[#3a3a3a]"
                      }`}
                    >
                      Your cart is empty
                    </div>
                    <div
                      className={`max-w-xs ${
                        isGlass ? "text-white/80" : "text-[#6a6a6a]"
                      }`}
                    >
                      Add items to get started
                    </div>
                  </div>
                ) : (
                  items.map((it) => (
                    <div
                      key={it.id}
                      className={`flex gap-4 p-4 rounded-2xl ${
                        isGlass
                          ? "bg-white/20 backdrop-blur-md border border-white/20 shadow-sm"
                          : "bg-[#e0e0e0]"
                      }`}
                      style={
                        isGlass
                          ? {}
                          : {
                              boxShadow:
                                "8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
                            }
                      }
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#e0e0e0] shrink-0">
                        <img
                          src={it.image || "/default-product.png"}
                          alt={it.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-semibold truncate ${
                            isGlass ? "text-white" : "text-[#3a3a3a]"
                          }`}
                        >
                          {it.name}
                        </div>
                        <div
                          className={`text-sm line-clamp-2 ${
                            isGlass ? "text-white/80" : "text-[#6a6a6a]"
                          }`}
                        >
                          {it.description}
                        </div>
                        <div className="text-[#8b7355] font-semibold mt-1">
                          ₹{it.price}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeFromCart(it.id)}
                          className={`p-1 rounded-full hover:bg-opacity-80 ${
                            isGlass ? "bg-white/30" : "bg-[#e0e0e0]"
                          }`}
                          style={
                            isGlass
                              ? {}
                              : {
                                  boxShadow:
                                    "2px 2px 4px #bebebe, -2px -2px 4px #ffffff",
                                }
                          }
                        >
                          <Trash2 className="w-4 h-4 text-[#dc2626]" />
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(it.id, it.quantity - 1)
                            }
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isGlass ? "bg-white/30" : "bg-[#e0e0e0]"
                            }`}
                            style={
                              isGlass
                                ? {}
                                : {
                                    boxShadow:
                                      "inset 2px 2px 4px #bebebe, inset -2px -2px 4px #ffffff",
                                  }
                              }
                          >
                            <Minus className="w-3 h-3 text-[#6a6a6a]" />
                          </button>
                          <span
                            className={`w-8 text-center font-semibold ${
                              isGlass ? "text-white" : "text-[#3a3a3a]"
                            }`}
                          >
                            {it.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(it.id, it.quantity + 1)
                            }
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isGlass ? "bg-white/30" : "bg-[#e0e0e0]"
                            }`}
                            style={
                              isGlass
                                ? {}
                                : {
                                    boxShadow:
                                      "inset 2px 2px 4px #bebebe, inset -2px -2px 4px #ffffff",
                                  }
                              }
                          >
                            <Plus className="w-3 h-3 text-[#6a6a6a]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {items.length > 0 && (
                <div className="border-t border-[#d0d0d0] p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-lg font-semibold ${
                        isGlass ? "text-white" : "text-[#3a3a3a]"
                      }`}
                    >
                      Total:
                    </span>
                    <span className="text-xl font-bold text-[var(--accent)]">
                      ₹{getTotalPrice()}
                    </span>
                  </div>
                  <div className="h-px w-full bg-[#d0d0d0]" />
                  <div className="space-y-3">
                    {isWhatsappOrderingEnabled && canWhatsApp ? (
                      <button
                        onClick={orderViaWhatsApp}
                        className="w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold"
                        style={{
                          boxShadow: "4px 4px 8px #bebebe, -4px -4px 8px #ffffff",
                        }}
                      >
                        <span className="inline-flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" /> Order via WhatsApp
                        </span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 rounded-2xl bg-gray-400 text-white font-semibold cursor-not-allowed opacity-50"
                        style={{
                          boxShadow: "4px 4px 8px #bebebe, -4px -4px 8px #ffffff",
                        }}
                      >
                        <span className="inline-flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" /> {!isWhatsappOrderingEnabled ? "WhatsApp Ordering Disabled" : "WhatsApp Not Available"}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={clearCart}
                      className={`w-full py-2 rounded-2xl border transition-all duration-300 ${
                        isGlass
                          ? "bg-white/20 border-white/20 text-white hover:bg-white/30"
                          : "bg-[#e0e0e0] border-[#d0d0d0] text-[#6a6a6a] hover:bg-[#f0f0f0]"
                      }`}
                      style={
                        isGlass
                          ? {}
                          : {
                              boxShadow:
                                "2px 2px 4px #bebebe, -2px -2px 4px #ffffff",
                            }
                      }
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
