import React, { useState } from 'react';
import { ShoppingCart, Heart } from 'lucide-react';

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
  isFeatured?: boolean;
}

interface FoodGridProps {
  items: Product[];
  onAddToCart: (item: Product) => void;
  hasMore?: boolean;
  loading?: boolean;
  loadMoreRef?: (node?: Element | null) => void;
  error?: string | null;
  onRetry?: () => void;
}

interface FoodCardProps {
  item: Product;
  onAddToCart: (item: Product) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ item, onAddToCart }) => {
  const [showHeart, setShowHeart] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      setShowHeart(true);
      onAddToCart(item);
      setTimeout(() => setShowHeart(false), 1000);
    }
    setLastTap(now);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHeart(true);
    onAddToCart(item);
    setTimeout(() => setShowHeart(false), 1000);
  };

  const displayPrice = item.offerPrice || item.price;
  const hasOffer = item.offerPrice && item.offerPrice < item.price;

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleDoubleTap}
    >
      {/* Image container */}
      <div className="relative aspect-square">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/default-product.png';
          }}
        />
        
        {/* Heart animation on double tap */}
        <div 
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
            showHeart ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Heart 
            className="w-20 h-20 text-red-500 fill-red-500 animate-bounce drop-shadow-lg" 
          />
        </div>

        {/* Cart button */}
        <button
          onClick={handleCartClick}
          className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
          aria-label={`Add ${item.name} to cart`}
        >
          <ShoppingCart className="w-5 h-5 text-blue-600" />
        </button>

        {/* Price tag */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-900">
              ₹{displayPrice}
            </span>
            {hasOffer && (
              <span className="text-xs text-gray-500 line-through">
                ₹{item.price}
              </span>
            )}
          </div>
        </div>

        {/* Featured badge */}
        {item.isFeatured && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
            ⭐
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
};

const FoodGrid: React.FC<FoodGridProps> = ({ 
  items, 
  onAddToCart, 
  hasMore = false, 
  loading = false, 
  loadMoreRef,
  error = null,
  onRetry 
}) => {
  if (error && items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600 mb-2">Failed to load products</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-gray-400 mb-2">🍽️</div>
          <p className="text-gray-500 text-center">No items found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or category</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="grid grid-cols-2 gap-3 p-4">
        {items.map((item) => (
          <FoodCard key={item.id} item={item} onAddToCart={onAddToCart} />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {(hasMore || loading) && !error && (
        <div 
          ref={loadMoreRef} 
          className="flex justify-center py-8"
        >
          {loading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          )}
        </div>
      )}

      {/* Error state for loading more */}
      {error && items.length > 0 && (
        <div className="text-center py-4">
          <p className="text-red-600 text-sm mb-2">Failed to load more products</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodGrid;