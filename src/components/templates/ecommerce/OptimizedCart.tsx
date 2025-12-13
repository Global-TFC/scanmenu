import React, { memo } from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus } from 'lucide-react';
import { Product } from '@/hooks/use-products';

interface CartItem extends Product {
  quantity: number;
}

interface OptimizedCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClearCart: () => void;
  onWhatsAppOrder: () => void;
  canWhatsApp: boolean;
  isWhatsappOrderingEnabled: boolean;
}

const OptimizedCart: React.FC<OptimizedCartProps> = memo(({
  isOpen,
  onClose,
  items,
  totalItems,
  totalPrice,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
  onWhatsAppOrder,
  canWhatsApp,
  isWhatsappOrderingEnabled,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[380px] md:w-[420px] bg-white border-l-[4px] border-black shadow-[0_0_0_4px_#000]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b-[4px] border-black flex items-center justify-between bg-yellow-200 shadow-[0_4px_0_#000]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-[3px] border-black shadow-[3px_3px_0_#000] rotate-[-2deg]">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <div className="text-black text-xl font-black uppercase">
                  Cart
                </div>
                <div className="text-black font-bold text-xs">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white border-[3px] border-black shadow-[3px_3px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
              aria-label="Close cart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-white border-[3px] border-black flex items-center justify-center mb-4 shadow-[4px_4px_0_#000]">
                  <ShoppingCart className="w-8 h-8 text-black" />
                </div>
                <div className="text-black text-lg font-black uppercase mb-2">
                  Your cart is empty
                </div>
                <div className="text-gray-700 text-xs font-bold uppercase">
                  Add products to get started
                </div>
              </div>
            ) : (
              items.map((item) => (
                <CartItemComponent
                  key={item.id}
                  item={item}
                  onRemove={onRemoveItem}
                  onUpdateQuantity={onUpdateQuantity}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t-[4px] border-black p-4 space-y-3 bg-yellow-100 shadow-[0_-4px_0_#000]">
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-black uppercase">
                  Total
                </span>
                <span className="text-xl font-black text-black">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClearCart}
                  className="flex-1 py-2 bg-white border-[3px] border-black font-black uppercase shadow-[3px_3px_0_#000]"
                >
                  Clear Cart
                </button>
                {isWhatsappOrderingEnabled && canWhatsApp ? (
                  <button
                    onClick={onWhatsAppOrder}
                    className="flex-1 py-2 bg-green-500 border-[3px] border-black font-black uppercase shadow-[3px_3px_0_#000] hover:bg-green-600"
                  >
                    WhatsApp Order
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 py-2 bg-gray-400 border-[3px] border-black font-black uppercase shadow-[3px_3px_0_#000] cursor-not-allowed opacity-50 text-white text-xs"
                  >
                    {!isWhatsappOrderingEnabled ? "WhatsApp Disabled" : "No WhatsApp"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Separate cart item component for better performance
const CartItemComponent = memo(({ 
  item, 
  onRemove, 
  onUpdateQuantity 
}: {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}) => (
  <div className="flex gap-3 p-3 bg-white border-[3px] border-black shadow-[4px_4px_0_#000]">
    <div className="relative w-16 h-16 border-[3px] border-black overflow-hidden">
      <img
        src={item.image || "/default-product.png"}
        alt={item.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-black text-black truncate uppercase">
        {item.name}
      </div>
      <div className="text-xs text-gray-700 font-bold uppercase">
        ₹{item.price}
      </div>
    </div>
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={() => onRemove(item.id)}
        className="p-1 bg-white border-[3px] border-black shadow-[3px_3px_0_#000]"
        aria-label={`Remove ${item.name} from cart`}
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8 bg-white border-[3px] border-black shadow-[3px_3px_0_#000] flex items-center justify-center"
          aria-label="Decrease quantity"
        >
          <Minus className="w-3 h-3 text-black" />
        </button>
        <span className="w-8 text-center font-black text-black">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 bg-white border-[3px] border-black shadow-[3px_3px_0_#000] flex items-center justify-center"
          aria-label="Increase quantity"
        >
          <Plus className="w-3 h-3 text-black" />
        </button>
      </div>
    </div>
  </div>
));

CartItemComponent.displayName = 'CartItemComponent';
OptimizedCart.displayName = 'OptimizedCart';

export default OptimizedCart;