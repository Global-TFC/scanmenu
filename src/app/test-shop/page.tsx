'use client'
import { useState } from "react";
import { Search, MapPin, Phone, Clock, Star, Heart, Grid3x3, List, ChevronDown } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  rating?: number;
  reviews?: number;
}

export default function MenuListing() {
  const [shopName] = useState("Delicious Bites");
  const [shopPlace] = useState("Downtown, Kozhikode");
  const [shopContact] = useState("+91 98765 43210");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  // const [showFilters, setShowFilters] = useState(false);

  const [products] = useState<Product[]>([
    {
      id: "1",
      name: "Classic Burger",
      category: "Fast Food",
      description: "Juicy beef patty with fresh lettuce, tomatoes, cheese, and special sauce",
      price: 8.99,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 128
    },
    {
      id: "2",
      name: "Margherita Pizza",
      category: "Italian",
      description: "Classic pizza with fresh mozzarella, basil, and tomato sauce",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 95
    },
    {
      id: "3",
      name: "Pasta Carbonara",
      category: "Italian",
      description: "Creamy pasta with bacon, eggs, and parmesan cheese",
      price: 14.50,
      image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 73
    },
    {
      id: "4",
      name: "Caesar Salad",
      category: "Salads",
      description: "Fresh romaine lettuce with caesar dressing, croutons, and parmesan",
      price: 9.99,
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop",
      rating: 4.3,
      reviews: 56
    },
    {
      id: "5",
      name: "Grilled Sandwich",
      category: "Fast Food",
      description: "Toasted sandwich with cheese, vegetables, and spicy mayo",
      price: 6.99,
      image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop",
      rating: 4.4,
      reviews: 89
    },
    {
      id: "6",
      name: "Spaghetti Bolognese",
      category: "Italian",
      description: "Traditional Italian pasta with rich meat sauce",
      price: 13.99,
      image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 112
    }
  ]);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b sticky top-0 z-30 backdrop-blur-lg bg-white/80">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {shopName}
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
              <Star className="text-amber-500 fill-amber-500" size={18} />
              <span className="font-bold text-gray-900">4.6</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 text-xs md:text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-orange-500 flex-shrink-0" />
              <span className="truncate">{shopPlace}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone size={14} className="text-green-500 flex-shrink-0" />
              <span>{shopContact}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-blue-500 flex-shrink-0" />
              <span>9 AM - 10 PM</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12 text-center text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">Explore Our Menu</h2>
          <p className="text-sm md:text-lg text-white/90">Fresh ingredients, amazing flavors</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300"
              }`}
            >
              {cat}
            </button>
          ))}
          
          <div className="ml-auto flex items-center gap-2 bg-white border border-gray-200 rounded-full p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition-all ${
                viewMode === "grid" ? "bg-orange-600 text-white" : "text-gray-500"
              }`}
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full transition-all ${
                viewMode === "list" ? "bg-orange-600 text-white" : "text-gray-500"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filteredProducts.length}</span> items
            {selectedCategory !== "All" && <span> in {selectedCategory}</span>}
          </p>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 text-lg font-medium">No items found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95"
                  >
                    <Heart 
                      size={18} 
                      className={favorites.has(product.id) ? "text-red-500 fill-red-500" : "text-gray-400"}
                    />
                  </button>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                    {product.category}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="text-white font-bold text-2xl">${product.price.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg">
                      <Star className="text-amber-500 fill-amber-500" size={14} />
                      <span className="ml-1 text-sm font-semibold text-gray-900">{product.rating}</span>
                    </div>
                    <span className="text-gray-400 text-xs">({product.reviews})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-40 h-40 flex-shrink-0 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95"
                    >
                      <Heart 
                        size={16} 
                        className={favorites.has(product.id) ? "text-red-500 fill-red-500" : "text-gray-400"}
                      />
                    </button>
                  </div>
                  
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
                          <span className="inline-block bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            {product.category}
                          </span>
                        </div>
                        <div className="text-orange-600 font-bold text-xl whitespace-nowrap">
                          ${product.price.toFixed(2)}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg">
                          <Star className="text-amber-500 fill-amber-500" size={14} />
                          <span className="ml-1 text-sm font-semibold text-gray-900">{product.rating}</span>
                        </div>
                        <span className="text-gray-400 text-xs">({product.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">© 2025 {shopName}. All rights reserved.</p>
          <p className="mt-1 text-xs text-gray-500">Create your own digital menu today!</p>
        </div>
      </footer>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}