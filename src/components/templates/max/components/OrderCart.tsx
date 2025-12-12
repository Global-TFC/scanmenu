import React from 'react';
import { ShoppingBag, Trash2, X, Plus, Minus } from 'lucide-react';

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

interface CartItem extends Product {
  quantity: number;
}

interface OrderCartProps {
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  onWhatsAppOrder?: () => void;
  canWhatsApp: boolean;
}

const OrderCart: React.FC<OrderCartProps> = ({
  items,
  onRemoveItem,
  onUpdateQuantity,
  isOpen,
  onToggle,
  onWhatsAppOrder,
  canWhatsApp,
}) => {
  const total = items.reduce((sum, item) => {
    const itemPrice = item.offerPrice || item.price;
    return sum + (itemPrice * item.quantity);
  }, 0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Only show cart button when there are items
  if (items.length === 0 && !isOpen) {
    return null;
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveItem(id);
    } else {
      onUpdateQuantity(id, newQuantity);
    }
  };

  return (
    <>
      {/* Cart panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-blue-50/80 backdrop-blur-2xl shadow-2xl z-40 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
            <div className=""></div>
            <button
              onClick={onToggle}
              className="hover:text-gray-700 bg-white transition-colors flex items-center justify-center rounded-full shadow-lg p-3 shadow-blue-100 border border-gray-200"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-center">Your cart is empty</p>
              <p className="text-center text-sm mt-1">Add items by tapping the cart button or double-tapping items</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3">
                {items.map((item) => {
                  const itemPrice = item.offerPrice || item.price;
                  const hasOffer = item.offerPrice && item.offerPrice < item.price;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-3xl shadow-lg p-3 shadow-blue-100 border border-gray-200"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/default-product.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600 font-bold text-sm">₹{itemPrice}</span>
                          {hasOffer && (
                            <span className="text-gray-400 text-xs line-through">₹{item.price}</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-gray-200 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Total</span>
                  <span className="text-2xl font-bold text-blue-600">₹{total.toFixed(0)}</span>
                </div>

                {canWhatsApp && onWhatsAppOrder ? (
                  <button
                    onClick={onWhatsAppOrder}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Order via WhatsApp</span>
                  </button>
                ) : (
                  <button
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    disabled
                  >
                    Place Order
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default OrderCart;