import React, { memo, useCallback, useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Product } from '@/hooks/use-products';

interface OptimizedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  index: number;
}

const OptimizedProductCard: React.FC<OptimizedProductCardProps> = memo(({
  product,
  onAddToCart,
  index,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = useCallback(() => {
    onAddToCart(product);
  }, [product, onAddToCart]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Calculate discount percentage
  const discountPercentage = useMemo(() => {
    return typeof product.offerPrice === "number" &&
           product.offerPrice < product.price
      ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
      : 0;
  }, [product.price, product.offerPrice]);

  const displayPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price;
  const hasValidPrice = (product.offerPrice && product.offerPrice > 0) || (product.price && product.price > 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[160px] sm:max-w-none mx-auto"
    >
      <div className="bg-white border-[3px] border-black p-3 shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all transform rotate-[-0.5deg] hover:rotate-[0deg]">
        {/* Image Container */}
        <div className="relative aspect-square border-[3px] border-black overflow-hidden mb-3">
          {!imageError ? (
            <Image
              src={product.image || "/default-product.png"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover"
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
          
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white font-black text-xs px-2 py-1 uppercase border-[2px] border-black shadow-[2px_2px_0_#000] rotate-[-3deg]">
              -{discountPercentage}%
            </div>
          )}
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
              {hasValidPrice && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-lg">
                  ₹{displayPrice.toFixed(0)}
                </span>
                {typeof product.offerPrice === "number" && product.offerPrice > 0 && product.price && product.price > 0 && product.offerPrice < product.price && (
                  <span className="text-xs font-bold text-gray-500 line-through">
                    ₹{product.price.toFixed(0)}
                  </span>
                )}
              </div>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="w-9 h-9 bg-black text-white border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all rotate-[3deg] hover:rotate-[0deg]"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-5 h-5 font-black" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

export default OptimizedProductCard;