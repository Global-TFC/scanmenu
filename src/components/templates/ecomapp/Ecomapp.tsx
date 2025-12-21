"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Search, ShoppingCart, Home, Phone, Bell, ChevronLeft, Filter, Star, Plus, Minus, Trash2, 
  X, MapPin, MessageCircle, ChevronRight 
} from "lucide-react";
import { useProducts, Product } from "@/hooks/use-products";
import Image from "next/image";

interface CartItem extends Product {
  cartId: string;
  quantity: number;
}

interface EcomappProps {
  shopName: string;
  shopPlace: string;
  shopContact: string;
  shopLogo?: string;
  locationUrl?: string;
  products: Product[];
  isWhatsappOrderingEnabled?: boolean;
  slug: string;
  themeConfig?: any;
}

export default function Ecomapp({
  shopName,
  shopPlace,
  shopContact,
  shopLogo,
  locationUrl,
  products: initialProducts,
  isWhatsappOrderingEnabled = true,
  slug,
  themeConfig,
}: EcomappProps) {
  const primaryColor = themeConfig?.primaryColor || "#f97316";
  const backgroundColor = themeConfig?.backgroundColor || "#f9fafb";
  const textColor = themeConfig?.textColor || "#111827";
  const fontFamily = themeConfig?.font === 'Serif' ? 'font-serif' : themeConfig?.font === 'Monospace' ? 'font-mono' : 'font-sans';

  const [activeTab, setActiveTab] = useState<"home" | "search" | "cart" | "contact">("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadedShopName, setLoadedShopName] = useState<string | null>(null);

  const {
    featuredProducts,
    regularProducts,
    loading,
    hasMore,
    loadMoreRef,
    categories,
    selectedCategory,
    setSelectedCategory,
  } = useProducts({ initialProducts, slug });

  // Load cart from session storage
  useEffect(() => {
    if (!shopName) return;
    try {
      const saved = sessionStorage.getItem(`cart_ecomapp_${shopName}`);
      if (saved) {
        setCart(JSON.parse(saved));
      } else {
        setCart([]);
      }
    } catch (e) {
      console.error("Failed to load cart", e);
      setCart([]);
    } finally {
      setLoadedShopName(shopName);
    }
  }, [shopName]);

  // Save cart to session storage
  useEffect(() => {
    if (loadedShopName !== shopName || !shopName) return;
    try {
      sessionStorage.setItem(`cart_ecomapp_${shopName}`, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [cart, shopName, loadedShopName]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, cartId: `${product.id}-${Date.now()}`, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const whatsappNumber = (shopContact || "").replace(/\s+/g, "");
  const canWhatsApp = Boolean(whatsappNumber && /\d/.test(whatsappNumber));

  const orderViaWhatsApp = useCallback(() => {
    if (!canWhatsApp || cart.length === 0) return;
    const orderItems = cart.map(it => `${it.name} x${it.quantity} - ₹${(it.offerPrice || it.price) * it.quantity}`).join("\n");
    const total = cart.reduce((sum, it) => sum + (it.offerPrice || it.price) * it.quantity, 0);
    const message = `Hi, I'd like to order:\n\n${orderItems}\n\nTotal: ₹${total}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  }, [canWhatsApp, cart, whatsappNumber]);

  const closeProduct = () => setSelectedProduct(null);
  const closeStory = () => setStoryIndex(null);

  return (
    <div 
      className={`min-h-screen pb-20 ${fontFamily} selection:bg-orange-100`}
      style={{ 
        '--primary': primaryColor, 
        '--background': backgroundColor, 
        '--text': textColor,
        backgroundColor: backgroundColor,
        color: textColor
      } as React.CSSProperties}
    >
      <style>{`
        .bg-primary { background-color: ${primaryColor} !important; }
        .text-primary { color: ${primaryColor} !important; }
        .border-primary { border-color: ${primaryColor} !important; }
        .shadow-primary\\/20 { box-shadow: 0 10px 15px -3px ${primaryColor}33; }
        .shadow-primary\\/30 { box-shadow: 0 10px 15px -3px ${primaryColor}4D; }
        .ring-primary { --tw-ring-color: ${primaryColor}; }
      `}</style>

      <main className="min-h-screen w-full">
        {activeTab === "home" && (
          <HomeView
            shopName={shopName}
            shopLogo={shopLogo}
            primaryColor={primaryColor}
            featuredProducts={featuredProducts}
            regularProducts={regularProducts}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onProductClick={setSelectedProduct}
            onFeaturedClick={(index) => setStoryIndex(index)}
            addToCart={addToCart}
            goToSearch={() => setActiveTab("search")}
            hasMore={hasMore}
            loading={loading}
            loadMoreRef={loadMoreRef}
          />
        )}
        {activeTab === "search" && (
          <SearchView
            primaryColor={primaryColor}
            regularProducts={regularProducts}
            onProductClick={setSelectedProduct}
            addToCart={addToCart}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {activeTab === "cart" && (
          <CartView
            primaryColor={primaryColor}
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            onProductClick={setSelectedProduct}
            onCheckout={orderViaWhatsApp}
            canWhatsApp={canWhatsApp && isWhatsappOrderingEnabled}
          />
        )}
        {activeTab === "contact" && (
          <ContactView
            shopName={shopName}
            shopPlace={shopPlace}
            shopContact={shopContact}
            locationUrl={locationUrl}
            primaryColor={primaryColor}
            canWhatsApp={canWhatsApp}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={cartCount}
        primaryColor={primaryColor}
      />

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={closeProduct}
          addToCart={addToCart}
          primaryColor={primaryColor}
        />
      )}

      {/* Story Viewer */}
      {storyIndex !== null && featuredProducts.length > 0 && (
        <StoryViewer
          items={featuredProducts}
          initialIndex={storyIndex}
          onClose={closeStory}
          addToCart={addToCart}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
}


// --- Views ---

interface HomeViewProps {
  shopName: string;
  shopLogo?: string;
  primaryColor: string;
  featuredProducts: Product[];
  regularProducts: Product[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onProductClick: (item: Product) => void;
  onFeaturedClick: (index: number) => void;
  addToCart: (item: Product) => void;
  goToSearch: () => void;
  hasMore: boolean;
  loading: boolean;
  loadMoreRef: (node?: Element | null) => void;
}

const HomeView = ({ 
  shopName, shopLogo, primaryColor, featuredProducts, regularProducts, categories,
  selectedCategory, setSelectedCategory, onProductClick, onFeaturedClick, addToCart, goToSearch,
  hasMore, loading, loadMoreRef
}: HomeViewProps) => {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="pb-8 rounded-b-[2.5rem] shadow-lg pt-safe-area-top relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="px-6 pt-8 pb-4 flex justify-between items-center text-white relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/10 overflow-hidden">
              {shopLogo ? (
                <img src={shopLogo} alt={shopName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-lg">🛒</span>
              )}
            </div>
            <div>
              <h1 className="font-bold text-xl leading-none tracking-tight">{shopName}</h1>
              <p className="text-white/70 text-xs font-medium">Discover & Buy</p>
            </div>
          </div>
        </div>

        {/* Search Trigger */}
        <div className="px-6 mt-4 relative z-10">
          <div className="flex gap-3">
            <div className="relative flex-1 group" onClick={goToSearch}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <div className="pl-12 h-14 rounded-2xl bg-white text-gray-400 border-none shadow-lg shadow-black/5 flex items-center select-none cursor-text">
                Search products...
              </div>
            </div>
            <button className="h-14 w-14 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/10 shadow-lg shadow-black/5 backdrop-blur-md flex items-center justify-center">
              <Filter className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <div className="mt-8 pl-6">
          <div className="flex justify-between items-baseline pr-6 mb-4">
            <h2 className="font-bold text-xl text-gray-900">Featured</h2>
          </div>
          <div className="flex overflow-x-auto pb-8 gap-4 snap-x snap-mandatory scrollbar-hide pr-6">
            {featuredProducts.map((item, index) => (
              <div key={item.id} className="min-w-[42vw] sm:min-w-[200px] snap-start">
                <div
                  className="border-none shadow-md overflow-hidden h-56 relative rounded-[1.5rem] group cursor-pointer active:scale-95 transition-transform duration-200 bg-gray-100"
                  onClick={() => onFeaturedClick(index)}
                >
                  <img src={item.image || "/default-product.png"} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-3 right-3 h-8 w-8 rounded-full border-2 bg-black/20 backdrop-blur-md flex items-center justify-center z-10 animate-pulse" style={{ borderColor: primaryColor }}>
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
                    <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-1">{item.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      {((item.offerPrice && item.offerPrice > 0) || (item.price && item.price > 0)) && (
                        <span className="font-bold tracking-wide" style={{ color: primaryColor }}>₹{item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="mt-0 pl-6">
        <div className="flex overflow-x-auto pb-6 pr-6 gap-3 scrollbar-hide">
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 active:scale-95 whitespace-nowrap ${
                selectedCategory === cat
                  ? "text-white shadow-lg ring-2 ring-offset-2"
                  : "bg-white text-gray-500 border border-gray-100 shadow-sm hover:shadow-md hover:text-gray-900"
              }`}
              style={selectedCategory === cat ? { backgroundColor: primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-6 pb-24">
        <h2 className="font-bold text-xl text-gray-900 mb-5">Popular Items</h2>
        <ProductGrid items={regularProducts} onProductClick={onProductClick} addToCart={addToCart} primaryColor={primaryColor} />
        
        {/* Infinite Scroll */}
        {(hasMore || loading) && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {loading && (
              <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `${primaryColor} transparent transparent transparent` }}></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


interface SearchViewProps {
  primaryColor: string;
  regularProducts: Product[];
  onProductClick: (item: Product) => void;
  addToCart: (item: Product) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const SearchView = ({ primaryColor, regularProducts, onProductClick, addToCart, searchQuery, setSearchQuery }: SearchViewProps) => {
  const filteredItems = useMemo(() => {
    if (!searchQuery) return regularProducts;
    const lowerQ = searchQuery.toLowerCase();
    return regularProducts.filter(item =>
      item.name.toLowerCase().includes(lowerQ) ||
      item.category.toLowerCase().includes(lowerQ)
    );
  }, [searchQuery, regularProducts]);

  return (
    <div className="animate-in fade-in pt-safe-area-top min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100 flex flex-col gap-2 p-6 pb-4">
        <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>Search</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-12 h-14 rounded-2xl bg-gray-100 border-transparent focus:bg-white focus:border-gray-200 shadow-sm text-lg outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-gray-200 rounded-full hover:bg-gray-300">
              <X className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 pb-24">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center opacity-50">
            <Search className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-500">No results found for "{searchQuery}"</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">Found {filteredItems.length} items</p>
            </div>
            <ProductGrid items={filteredItems} onProductClick={onProductClick} addToCart={addToCart} primaryColor={primaryColor} />
          </>
        )}
      </div>
    </div>
  );
};

interface CartViewProps {
  primaryColor: string;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  onProductClick: (item: Product) => void;
  onCheckout: () => void;
  canWhatsApp: boolean;
}

const CartView = ({ primaryColor, cart, updateQuantity, removeFromCart, onProductClick, onCheckout, canWhatsApp }: CartViewProps) => {
  const subtotal = cart.reduce((sum, item) => sum + ((item.offerPrice || item.price) * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-50">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}20` }}>
          <ShoppingCart className="h-10 w-10" style={{ color: primaryColor }} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-safe-area-top pb-32 animate-in slide-in-from-right-10 duration-300">
      <div className="p-6 sticky top-0 bg-gray-50/90 backdrop-blur-sm z-20">
        <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
        <p className="text-gray-500">{cart.reduce((acc, i) => acc + i.quantity, 0)} items</p>
      </div>

      <div className="px-6 space-y-4">
        {cart.map((item) => (
          <div key={item.cartId} className="bg-white rounded-3xl p-3 flex gap-4 shadow-sm border border-gray-100 items-center">
            <div className="h-24 w-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0 cursor-pointer" onClick={() => onProductClick(item)}>
              <img src={item.image || "/default-product.png"} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 py-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 truncate pr-2">{item.name}</h3>
                <button onClick={() => removeFromCart(item.cartId)} className="text-gray-400 hover:text-red-500 p-1 -mr-2 -mt-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-2">{item.category}</p>
              <div className="flex justify-between items-center mt-2">
                {((item.offerPrice && item.offerPrice > 0) || (item.price && item.price > 0)) && (
                  <span className="font-bold text-lg" style={{ color: primaryColor }}>₹{item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price}</span>
                )}
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-2 py-1">
                  <button onClick={() => updateQuantity(item.cartId, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 active:scale-90 transition-transform">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.cartId, 1)} className="w-6 h-6 flex items-center justify-center text-white rounded-full shadow-sm active:scale-90 transition-transform" style={{ backgroundColor: primaryColor }}>
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Summary */}
      <div className="fixed bottom-[80px] left-6 right-6 z-30">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 ring-1 ring-black/5">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax (8%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="my-2 h-px bg-gray-100"></div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900 text-lg">Total</span>
              <span className="font-extrabold text-xl" style={{ color: primaryColor }}>₹{total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={onCheckout}
            disabled={!canWhatsApp}
            className="w-full h-14 rounded-xl text-lg font-bold shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
          >
            {canWhatsApp ? "Checkout via WhatsApp" : "WhatsApp Not Available"}
          </button>
        </div>
      </div>
    </div>
  );
};


interface ContactViewProps {
  shopName: string;
  shopPlace: string;
  shopContact: string;
  locationUrl?: string;
  primaryColor: string;
  canWhatsApp: boolean;
}

const ContactView = ({ shopName, shopPlace, shopContact, locationUrl, primaryColor, canWhatsApp }: ContactViewProps) => {
  // Extract Google Maps embed URL from various Google Maps URL formats
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // If it's already an embed URL, return as is
    if (url.includes('/embed')) return url;
    
    // Extract place/coordinates from various Google Maps URL formats
    // Format: https://www.google.com/maps/place/...
    // Format: https://maps.google.com/?q=...
    // Format: https://goo.gl/maps/...
    
    try {
      // Try to extract coordinates or place query
      if (url.includes('maps.google.com') || url.includes('google.com/maps')) {
        // Convert to embed format
        const encodedUrl = encodeURIComponent(url);
        return `https://www.google.com/maps?q=${encodedUrl}&output=embed`;
      }
      // For shortened URLs or other formats, use the URL directly in iframe
      return `https://www.google.com/maps?q=${encodeURIComponent(shopPlace || url)}&output=embed`;
    } catch {
      return null;
    }
  };

  const embedUrl = locationUrl ? getEmbedUrl(locationUrl) : null;
  const hasLocation = Boolean(locationUrl);

  const contactOptions = [
    { 
      id: 1, 
      title: "Our Location", 
      subtitle: shopPlace || "Location not set", 
      icon: <MapPin className="h-6 w-6 text-blue-600" />, 
      bg: "bg-blue-100",
      action: hasLocation ? () => window.open(locationUrl, "_blank") : undefined
    },
    { id: 2, title: "WhatsApp Us", subtitle: "Chat for quick support", icon: <MessageCircle className="h-6 w-6 text-green-600" />, bg: "bg-green-100", action: canWhatsApp ? () => window.open(`https://wa.me/${shopContact?.replace(/\s+/g, "")}`, "_blank") : undefined },
    { id: 3, title: "Call Now", subtitle: shopContact || "Contact not set", icon: <Phone className="h-6 w-6" style={{ color: primaryColor }} />, bg: "bg-orange-100", action: shopContact ? () => window.open(`tel:${shopContact}`, "_self") : undefined },
  ];

  return (
    <div className="animate-in fade-in min-h-screen bg-gray-50 flex flex-col">
      <div className="pt-safe-area-top pb-12 rounded-b-[3rem] shadow-xl relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="flex flex-col items-center justify-center pt-10 relative z-10 px-6">
          <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-4 transform rotate-3 border-4 border-white/20">
            <span className="text-4xl">🛒</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{shopName}</h1>
          <p className="text-white/70 text-sm font-medium mt-1">Contact Us</p>
        </div>
      </div>

      <div className="flex-1 px-6 -mt-8 relative z-20 space-y-4">
        {contactOptions.map((opt) => (
          <div 
            key={opt.id} 
            onClick={opt.action}
            className={`bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center justify-between group ${opt.action ? 'cursor-pointer active:scale-95' : ''} transition-all duration-200`}
          >
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${opt.bg}`}>
                {opt.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{opt.title}</h3>
                <p className="text-xs text-gray-500 font-medium">{opt.subtitle}</p>
              </div>
            </div>
            {opt.action && (
              <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:text-white transition-all shadow-sm">
                <ChevronRight className="h-5 w-5" />
              </div>
            )}
          </div>
        ))}

        {/* Google Maps Embed */}
        {embedUrl && (
          <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" style={{ color: primaryColor }} />
              Find Us
            </h3>
            <div className="rounded-2xl overflow-hidden h-48 bg-gray-100">
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shop Location"
              />
            </div>
            {locationUrl && (
              <button
                onClick={() => window.open(locationUrl, "_blank")}
                className="w-full mt-3 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                Open in Google Maps
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-6 pb-32 text-center">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
          Powered by <span className="text-gray-600 font-extrabold">ScanMenu</span>
        </p>
      </div>
    </div>
  );
};

// --- Story Viewer ---

interface StoryViewerProps {
  items: Product[];
  initialIndex: number;
  onClose: () => void;
  addToCart: (item: Product) => void;
  primaryColor: string;
}

const StoryViewer = ({ items, initialIndex, onClose, addToCart, primaryColor }: StoryViewerProps) => {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          if (index < items.length - 1) {
            setIndex(i => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return old + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [index, items.length, onClose]);

  const handleNext = () => index < items.length - 1 ? setIndex(index + 1) : onClose();
  const handlePrev = () => index > 0 && setIndex(index - 1);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const diffX = touchStart.x - e.changedTouches[0].clientX;
    const diffY = touchStart.y - e.changedTouches[0].clientY;
    if (Math.abs(diffX) > 50) diffX > 0 ? handleNext() : handlePrev();
    else if (Math.abs(diffY) > 50) onClose();
    else e.changedTouches[0].clientX > window.innerWidth / 2 ? handleNext() : handlePrev();
    setTouchStart(null);
  };

  const currentItem = items[index];

  return (
    <div className="fixed inset-0 z-50 bg-black text-white animate-in fade-in duration-300" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="absolute inset-0">
        <img src={currentItem.image || "/default-product.png"} alt={currentItem.name} className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
      </div>

      {/* Progress Bars */}
      <div className="absolute top-4 left-2 right-2 flex gap-1 z-20 pt-safe-area-top">
        {items.map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-75 linear" style={{ width: i < index ? '100%' : i === index ? `${progress}%` : '0%' }}></div>
          </div>
        ))}
      </div>

      {/* Close Button */}
      <button onClick={onClose} className="absolute top-8 right-4 z-20 p-2 bg-black/20 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors mt-4">
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Product Info */}
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 z-20">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] shadow-2xl text-center">
          <h2 className="text-3xl font-bold mb-3 text-white drop-shadow-md leading-tight">{currentItem.name}</h2>
          <div className="flex justify-center items-center gap-3 mb-6">
            <span className="px-4 py-1.5 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">{currentItem.category}</span>
          </div>
          {((currentItem.offerPrice && currentItem.offerPrice > 0) || (currentItem.price && currentItem.price > 0)) && (
            <p className="text-5xl font-black drop-shadow-lg mb-2" style={{ color: primaryColor }}>
              ₹{currentItem.offerPrice && currentItem.offerPrice > 0 ? currentItem.offerPrice : currentItem.price}
            </p>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="absolute bottom-12 left-6 right-6 z-20 pb-safe-area-bottom">
        <button
          className="w-full h-16 rounded-2xl text-white font-bold text-xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
          style={{ backgroundColor: primaryColor }}
          onClick={(e) => { e.stopPropagation(); addToCart(currentItem); }}
        >
          <Plus className="h-7 w-7" />
          Add to Cart
        </button>
        <p className="text-center text-white/50 text-xs mt-6 animate-pulse font-medium">Swipe Up/Down to Close</p>
      </div>
    </div>
  );
};


// --- Shared Components ---

interface ProductGridProps {
  items: Product[];
  onProductClick: (item: Product) => void;
  addToCart: (item: Product) => void;
  primaryColor: string;
}

const ProductGrid = ({ items, onProductClick, addToCart, primaryColor }: ProductGridProps) => (
  <div className="grid grid-cols-2 gap-4">
    {items.map((item) => (
      <div
        key={item.id}
        className="bg-white rounded-3xl p-3 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-gray-100 transition-all duration-200 group hover:shadow-md"
      >
        <div
          className="h-36 w-full rounded-2xl overflow-hidden mb-3 relative bg-gray-50 cursor-pointer"
          onClick={() => onProductClick(item)}
        >
          <img src={item.image || "/default-product.png"} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        </div>
        <div className="px-1">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1 cursor-pointer" onClick={() => onProductClick(item)}>{item.name}</h3>
          <div className="flex justify-between items-center">
            <div className="flex flex-col" onClick={() => onProductClick(item)}>
              <span className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">{item.category}</span>
              {((item.offerPrice && item.offerPrice > 0) || (item.price && item.price > 0)) && (
                <span className="font-bold text-base" style={{ color: primaryColor }}>₹{item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price}</span>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); addToCart(item); }}
              className="h-9 w-9 bg-black rounded-full flex items-center justify-center text-white shadow-lg shadow-black/20 hover:opacity-80 active:scale-90 transition-all"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  addToCart: (item: Product) => void;
  primaryColor: string;
}

const ProductModal = ({ product, onClose, addToCart, primaryColor }: ProductModalProps) => (
  <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom duration-300 overflow-y-auto">
    <div className="relative min-h-screen pb-10">
      <button
        className="absolute top-4 left-4 z-10 bg-white/50 backdrop-blur-md rounded-full hover:bg-white shadow-sm p-2"
        onClick={onClose}
      >
        <ChevronLeft className="h-6 w-6 text-gray-800" />
      </button>

      <div className="h-[45vh] w-full relative">
        <img src={product.image || "/default-product.png"} alt={product.name} className="w-full h-full object-cover rounded-b-[2.5rem] shadow-lg" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent rounded-b-[2.5rem]"></div>
      </div>

      <div className="px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100/50">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight w-[70%]">{product.name}</h2>
            {((product.offerPrice && product.offerPrice > 0) || (product.price && product.price > 0)) && (
              <span className="text-xl font-bold" style={{ color: primaryColor }}>₹{product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>{product.category}</span>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              {product.description || "A delicious item prepared with fresh ingredients."}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <button
              className="w-full h-14 text-lg rounded-2xl shadow-lg font-bold tracking-wide text-white"
              style={{ backgroundColor: primaryColor }}
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface BottomNavProps {
  activeTab: "home" | "search" | "cart" | "contact";
  setActiveTab: (tab: "home" | "search" | "cart" | "contact") => void;
  cartCount: number;
  primaryColor: string;
}

const BottomNav = ({ activeTab, setActiveTab, cartCount, primaryColor }: BottomNavProps) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-5 flex justify-between items-center z-40 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] rounded-t-3xl">
    <NavButton active={activeTab === "home"} icon={Home} label="Home" onClick={() => setActiveTab("home")} primaryColor={primaryColor} />
    <NavButton active={activeTab === "search"} icon={Search} label="Search" onClick={() => setActiveTab("search")} primaryColor={primaryColor} />
    <NavButton active={activeTab === "cart"} icon={ShoppingCart} label="Cart" onClick={() => setActiveTab("cart")} badge={cartCount} primaryColor={primaryColor} />
    <NavButton active={activeTab === "contact"} icon={Phone} label="Contact" onClick={() => setActiveTab("contact")} primaryColor={primaryColor} />
  </div>
);

interface NavButtonProps {
  active: boolean;
  icon: any;
  label: string;
  onClick: () => void;
  badge?: number;
  primaryColor: string;
}

const NavButton = ({ active, icon: Icon, label, onClick, badge, primaryColor }: NavButtonProps) => (
  <button onClick={onClick} className="relative flex flex-col items-center justify-center w-16 h-12 group">
    <div 
      className={`absolute -top-1 transition-all duration-300 rounded-full ${active ? "w-12 h-12 opacity-100 scale-100" : "w-0 h-0 opacity-0 scale-0"}`}
      style={{ backgroundColor: `${primaryColor}15` }}
    ></div>
    <div className="relative">
      <Icon
        className={`h-6 w-6 transition-all duration-300 relative z-10 ${active ? "scale-110 -translate-y-1" : "text-gray-400 group-hover:text-gray-600"}`}
        style={active ? { color: primaryColor } : {}}
        strokeWidth={active ? 2.5 : 2}
      />
      {badge ? (
        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white z-20">
          {badge}
        </span>
      ) : null}
    </div>
    <span 
      className={`text-[10px] font-bold mt-1 transition-all duration-300 absolute bottom-0 ${active ? "opacity-100 translate-y-0" : "text-transparent opacity-0 translate-y-2"}`}
      style={active ? { color: primaryColor } : {}}
    >
      {label}
    </span>
  </button>
);
