import React, { useState, memo, useCallback } from 'react';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import ProductSkeleton from './ProductSkeleton';

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

interface FoodCardProps {
  item: Product;
  onAddToCart: (item: Product) => void;
}

const FoodCard: React.FC<FoodCardProps> = memo(({ item, onAddToCart }) => {
  const [lastTap, setLastTap] = useState(0);
  const [imageError, setImageError] = useState(false);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap < 300) {
      onAddToCart(item);
    }
    setLastTap(now);
  }, [lastTap, onAddToCart, item]);

  const handleCartClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(item);
  }, [onAddToCart, item]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const displayPrice = item.offerPrice || item.price;
  const hasOffer = item.offerPrice && item.offerPrice < item.price;

  return (
    <div
      className="group relative bg-gradient-to-br from-blue-50 via-white to-white 
                 rounded-3xl overflow-hidden border border-gray-200 
                 shadow-blue-100 shadow-xl 
                 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-100/60
                 cursor-pointer select-none"
      onClick={handleDoubleTap}
    >
      {/* Hover Shine Effect */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
      </div>

      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {!imageError ? (
          <Image
            src={item.image || '/default-product.png'}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-2 rounded-3xl transition-transform duration-700 group-hover:scale-110"
            onError={handleImageError}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* Featured Badge */}
        {item.isFeatured && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-xl flex items-center gap-1">
            Featured
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-1 left-2 bg-white/95 backdrop-blur-lg border border-gray-200 px-3 py-2 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-900">₹{displayPrice}</span>
            {hasOffer && (
              <span className="text-xs text-gray-500 line-through font-medium">₹{item.price}</span>
            )}
          </div>
        </div>

        {/* Floating Add to Cart Button */}
        <button
          onClick={handleCartClick}
          className="absolute -bottom-5 z-30 right-2 p-3 pb-5 bg-white rounded-3xl shadow-2xl border border-gray-200 
                     hover:bg-blue-50 hover:border-blue-300 hover:shadow-blue-200 
                     transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label={`Add ${item.name} to cart`}
        >
          <ShoppingCart className="w-6 h-6 text-blue-600" />
        </button>
      </div>

      {/* Card Content */}
      <div className="px-4 py-2">
        <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
          {item.name}
        </h3>
      </div>
    </div>
  );
});

FoodCard.displayName = 'FoodCard';

interface FoodGridProps {
  items: Product[];
  onAddToCart: (item: Product) => void;
  hasMore?: boolean;
  loading?: boolean;
  loadMoreRef?: (node?: Element | null) => void;
  error?: string | null;
  onRetry?: () => void;
  searchTerm?: string;
}

const FoodGrid: React.FC<FoodGridProps> = ({
  items,
  onAddToCart,
  hasMore = false,
  loading = false,
  loadMoreRef,
  error = null,
  onRetry,
  searchTerm = "",
}) => {
  // Empty state
  if (items.length === 0 && !loading && !error) {
    const isSearching = searchTerm && searchTerm.trim() !== '';
    
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {isSearching ? '🔍' : 'No Plate'}
          </div>
          <p className="text-gray-500">
            {isSearching ? 'Product not found' : 'No items found'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {isSearching 
              ? `No products match "${searchTerm}"`
              : 'Try adjusting your search or filters'
            }
          </p>
        </div>
      </div>
    );
  }

  // Error state (first load)
  if (error && items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="text-center">
          <div className="text-6xl mb-4">Warning</div>
          <p className="text-gray-600 mb-2">Failed to load products</p>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      <div className="grid grid-cols-2 gap-5 px-5 py-8 max-w-5xl mx-auto">
        {items.map((item) => (
          <FoodCard key={item.id} item={item} onAddToCart={onAddToCart} />
        ))}
        
        {/* Show skeleton loaders while loading more */}
        {loading && Array.from({ length: 4 }).map((_, index) => (
          <ProductSkeleton key={`skeleton-${index}`} />
        ))}
      </div>

      {/* Infinite Scroll Loader */}
      {(hasMore || loading) && !error && (
        <div ref={loadMoreRef} className="flex justify-center py-10">
          {loading && (
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          )}
        </div>
      )}

      {/* Load More Error */}
      {error && items.length > 0 && (
        <div className="text-center py-6">
          <p className="text-red-600 text-sm mb-3">Failed to load more items</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-5 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition"
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