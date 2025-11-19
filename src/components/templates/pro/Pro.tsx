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
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  offerPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
}

export default function Pro({
  shopName,
  shopPlace,
  shopContact,
  products,
}: {
  shopName: string;
  shopPlace: string;
  shopContact: string;
  products: Product[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showWhatsAppFloat, setShowWhatsAppFloat] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [items, setItems] = useState<(Product & { quantity: number })[]>([]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const byCategory =
      selectedCategory === "All"
        ? products
        : products.filter((p) => p.category === selectedCategory);
    const bySearch = searchTerm
      ? byCategory.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : byCategory;
    return bySearch;
  }, [products, selectedCategory, searchTerm]);

  useEffect(() => {
    const onScroll = () => setShowWhatsAppFloat(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          `${it.name} x${it.quantity} - ₹${(it.price * it.quantity).toFixed(2)}`
      )
      .join("\n");
    const message = `Hi I'd Like Order :\n\n${orderItems}\n\nTotal: ₹${getTotalPrice().toFixed(
      2
    )}`;
    openWhatsApp(message);
  };

  return (
    <div className="min-h-screen bg-[#e0e0e0]">
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-2">
        <div
          className="max-w-7xl mx-auto rounded-full bg-[#e0e0e0] flex items-center justify-between gap-4 px-4 sm:px-6 py-2"
          style={{ border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <Link href="#top" className="flex items-center gap-2 shrink-0">
            <span
              className="inline-block w-7 h-7 rounded-full bg-[#e0e0e0]"
              style={{
                boxShadow:
                  "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
              }}
              aria-hidden
            />
            <span className="text-[#3a3a3a] font-semibold tracking-tight">
              {shopName || "Shop"}
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[#6a6a6a] mx-auto">
            <a
              href="#best-sellers"
              className="hover:text-[#3a3a3a] transition-colors"
            >
              Best Sellers
            </a>
            <a
              href="#products"
              className="hover:text-[#3a3a3a] transition-colors"
            >
              Collection
            </a>
            <a
              href="#features"
              className="hover:text-[#3a3a3a] transition-colors"
            >
              Features
            </a>
            <a href="#about" className="hover:text-[#3a3a3a] transition-colors">
              About
            </a>
            <a
              href="#contact"
              className="hover:text-[#3a3a3a] transition-colors"
            >
              Contact
            </a>
          </div>
          <div className="flex items-center gap-2">
            {canWhatsApp && (
              <button
                onClick={() =>
                  openWhatsApp("Hello! I'd like to place an order")
                }
                className="relative px-4 py-2 rounded-full bg-[#e0e0e0] text-[#3a3a3a] font-semibold"
                style={{
                  boxShadow:
                    "inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff",
                }}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Order</span>
                </div>
              </button>
            )}
            <button
              onClick={() => setCartOpen(true)}
              className="relative px-4 py-2 rounded-full bg-[#e0e0e0] text-[#3a3a3a] font-semibold"
              style={{
                boxShadow:
                  "inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff",
              }}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                {getTotalItems() > 0 && (
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-xs bg-[#8b7355] text-white"
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
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3a3a3a] mb-4">
              {shopName}
            </h2>
            <p className="text-lg text-[#6a6a6a] mb-8">
              Discover premium items for every occasion
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="px-8 py-4 rounded-2xl bg-[#e0e0e0] transition-all duration-300 font-medium"
                  style={{
                    boxShadow:
                      selectedCategory === category
                        ? "inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff"
                        : "6px 6px 12px #bebebe, -6px -6px 12px #ffffff",
                  }}
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
                  className="w-full pl-12 pr-4 py-3.5 bg-[#eaeaea] border border-[#dcdcdc] rounded-2xl focus:ring-2 focus:ring-[#8b7355] focus:border-transparent shadow-sm text-[#3a3a3a]"
                />
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="inline-flex items-center justify-center w-16 h-16 bg-[#e0e0e0] rounded-full mb-4"
                style={{
                  boxShadow:
                    "inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff",
                }}
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
                <div
                  key={product.id}
                  className="group rounded-3xl bg-[#e0e0e0] overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                  style={{
                    boxShadow:
                      "16px 16px 32px #bebebe, -16px -16px 32px #ffffff",
                  }}
                >
                  <div className="relative overflow-hidden h-72">
                    <img
                      src={product.image || "/default-product.png"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#3a3a3a] mb-2">
                      {product.name}
                    </h3>
                    <p className="text-[#6a6a6a] mb-4 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-[#3a3a3a]">
                              ₹{(product.offerPrice ?? product.price).toFixed(2)}
                            </span>
                            {typeof product.offerPrice === "number" && product.offerPrice < product.price && (
                              <>
                                <span className="text-lg text-[#8a8a8a] line-through">
                                  ₹{product.price.toFixed(2)}
                                </span>
                                <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                  {Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF
                                </span>
                              </>
                            )}
                          </div>
                          <span className="text-lg text-[#8a8a8a]">INR</span>
                        </div>
                      <div className="flex items-center gap-2">
                        {canWhatsApp && (
                          <button
                            onClick={() =>
                              openWhatsApp(
                                `Hello! I'd like to order: ${
                                  product.name
                                } (₹${product.price.toFixed(2)})`
                              )
                            }
                            className="p-4 rounded-2xl bg-[#e0e0e0] transition-all duration-300 hover:scale-110 active:scale-95"
                            style={{
                              boxShadow:
                                "6px 6px 12px #bebebe, -6px -6px 12px #ffffff",
                            }}
                          >
                            <MessageCircle className="w-6 h-6 text-[#25D366]" />
                          </button>
                        )}
                        <button
                          onClick={() => addToCart(product)}
                          className="p-4 rounded-2xl bg-[#e0e0e0] transition-all duration-300 hover:scale-110 active:scale-95"
                          style={{
                            boxShadow:
                              "6px 6px 12px #bebebe, -6px -6px 12px #ffffff",
                          }}
                        >
                          <ShoppingCart className="w-6 h-6 text-[#8b7355]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          id="about"
          className="py-24 px-4 bg-[#e8e8e8] rounded-3xl"
          style={{
            boxShadow:
              "inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff",
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3a3a3a] mb-6">
              About
            </h2>
            <p className="text-lg text-[#6a6a6a] leading-relaxed mb-12">
              We source the finest products, where traditional methods meet
              modern quality standards. Each item is inspected to meet exacting
              standards for taste and quality.
            </p>
          </div>
        </section>

        <section id="contact" className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-[#3a3a3a] mb-6">
              Order Today
            </h2>
            <p className="text-lg text-[#6a6a6a] leading-relaxed mb-12">
              Contact us via WhatsApp for instant ordering and personalized
              service.
            </p>
            {canWhatsApp && (
              <button
                onClick={() =>
                  openWhatsApp("Hello! I'd like to place an order")
                }
                className="px-10 py-5 rounded-2xl bg-[#25D366] text-white font-semibold transition-all duration-300 inline-flex items-center gap-3 hover:scale-[1.02]"
                style={{
                  boxShadow: "4px 4px 8px #bebebe, -4px -4px 8px #ffffff",
                }}
              >
                <MessageCircle className="w-5 h-5" /> Order via WhatsApp
              </button>
            )}
          </div>
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
            className="w-16 h-16 rounded-full bg-[#e0e0e0] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            style={{
              boxShadow: "10px 10px 20px #bebebe, -10px -10px 20px #ffffff",
            }}
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
            className="absolute right-0 top-0 h-full w-[400px] sm:w-[540px] bg-[#e0e0e0] shadow-xl"
            style={{ boxShadow: "-8px 0 24px rgba(0,0,0,0.15)" }}
          >
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-[#d0d0d0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full bg-[#e0e0e0] flex items-center justify-center"
                    style={{
                      boxShadow:
                        "inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff",
                    }}
                  >
                    <ShoppingCart className="w-5 h-5 text-[#8b7355]" />
                  </div>
                  <div>
                    <div className="text-[#3a3a3a] text-xl font-semibold">
                      Shopping Cart
                    </div>
                    <div className="text-[#6a6a6a]">
                      {getTotalItems()} item{getTotalItems() !== 1 ? "s" : ""}{" "}
                      in your cart
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 rounded-full bg-[#e0e0e0]"
                  style={{
                    boxShadow: "2px 2px 4px #bebebe, -2px -2px 4px #ffffff",
                  }}
                >
                  <X className="w-4 h-4 text-[#6a6a6a]" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div
                      className="w-20 h-20 rounded-full bg-[#e0e0e0] flex items-center justify-center mb-4"
                      style={{
                        boxShadow:
                          "inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff",
                      }}
                    >
                      <ShoppingCart className="w-8 h-8 text-[#8b7355]" />
                    </div>
                    <div className="text-lg font-semibold text-[#3a3a3a] mb-2">
                      Your cart is empty
                    </div>
                    <div className="text-[#6a6a6a] max-w-xs">
                      Add items to get started
                    </div>
                  </div>
                ) : (
                  items.map((it) => (
                    <div
                      key={it.id}
                      className="flex gap-4 p-4 rounded-2xl bg-[#e0e0e0]"
                      style={{
                        boxShadow:
                          "8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
                      }}
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#e0e0e0] shrink-0">
                        <img
                          src={it.image || "/default-product.png"}
                          alt={it.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#3a3a3a] truncate">
                          {it.name}
                        </div>
                        <div className="text-sm text-[#6a6a6a] line-clamp-2">
                          {it.description}
                        </div>
                        <div className="text-[#8b7355] font-semibold mt-1">
                          ₹{it.price}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeFromCart(it.id)}
                          className="p-1 rounded-full bg-[#e0e0e0] hover:bg-[#f0f0f0]"
                          style={{
                            boxShadow:
                              "2px 2px 4px #bebebe, -2px -2px 4px #ffffff",
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-[#dc2626]" />
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(it.id, it.quantity - 1)
                            }
                            className="w-8 h-8 rounded-full bg-[#e0e0e0] flex items-center justify-center"
                            style={{
                              boxShadow:
                                "inset 2px 2px 4px #bebebe, inset -2px -2px 4px #ffffff",
                            }}
                          >
                            <Minus className="w-3 h-3 text-[#6a6a6a]" />
                          </button>
                          <span className="w-8 text-center font-semibold text-[#3a3a3a]">
                            {it.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(it.id, it.quantity + 1)
                            }
                            className="w-8 h-8 rounded-full bg-[#e0e0e0] flex items-center justify-center"
                            style={{
                              boxShadow:
                                "inset 2px 2px 4px #bebebe, inset -2px -2px 4px #ffffff",
                            }}
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
                    <span className="text-lg font-semibold text-[#3a3a3a]">
                      Total:
                    </span>
                    <span className="text-xl font-bold text-[#8b7355]">
                      ₹{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                  <div className="h-px w-full bg-[#d0d0d0]" />
                  <div className="space-y-3">
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
                    <button
                      onClick={clearCart}
                      className="w-full py-2 rounded-2xl bg-[#e0e0e0] border border-[#d0d0d0] text-[#6a6a6a] hover:bg-[#f0f0f0]"
                      style={{
                        boxShadow: "2px 2px 4px #bebebe, -2px -2px 4px #ffffff",
                      }}
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
