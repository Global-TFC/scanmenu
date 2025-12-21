import React, { memo } from 'react';
import { ShoppingBag } from 'lucide-react';

interface CartItem {
  id: string;
  quantity: number;
  price: number;
  offerPrice?: number;
}

interface OptimizedCartButtonProps {
  cartItems: CartItem[];
  cartItemCount: number;
  isCartOpen: boolean;
  onToggleCart: () => void;
}

const OptimizedCartButton: React.FC<OptimizedCartButtonProps> = memo(({
  cartItems,
  cartItemCount,
  isCartOpen,
  onToggleCart,
}) => {
  // Early return if no items or cart is open
  if (cartItemCount === 0 || isCartOpen) {
    return null;
  }

  // Memoize total calculation
  const total = React.useMemo(() => {
    return Math.round(
      cartItems.reduce((sum, item) => 
        sum + (item.offerPrice || item.price) * item.quantity, 0
      )
    );
  }, [cartItems]);

  return (
    <button
      onClick={onToggleCart}
      className="fixed bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 
         px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 
         rounded-full bg-primary text-white shadow-2xl 
         flex items-center gap-2 sm:gap-3 
         hover:scale-105 active:scale-95 hover:opacity-90
         transition-all duration-200 animate-bounce-in
         whitespace-nowrap min-w-max
         border-2 border-white/20"
      aria-label={`View cart with ${cartItemCount} items, total ₹${total}`}
    >
      <div className="relative">
        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
        {/* Badge for item count */}
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center border border-white">
          {cartItemCount > 99 ? '99+' : cartItemCount}
        </div>
      </div>

      <span className="font-semibold text-xs sm:text-sm md:text-base flex items-center gap-1.5 sm:gap-2">
        <span className="hidden sm:inline">
          {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
        </span>
        <span className="font-bold text-yellow-300">
          ₹{total}
        </span>
      </span>
    </button>
  );
});

OptimizedCartButton.displayName = 'OptimizedCartButton';

export default OptimizedCartButton;