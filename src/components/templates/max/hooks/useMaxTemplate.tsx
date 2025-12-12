import { useState, useMemo, useCallback } from 'react';
import { Product } from '@/hooks/use-products';
import {
  CartItem,
  calculateCartItemCount,
  createWhatsAppOrderUrl,
} from '../utils/maxHelpers';

interface UseMaxTemplateProps {
  products: Product[];
  shopName: string;
  shopContact?: string;
  isWhatsappOrderingEnabled?: boolean;
}

interface UseMaxTemplateReturn {
  // Specials swiper
  showSpecialsSwiper: boolean;
  closeSpecialsSwiper: () => void;
  
  // Cart management
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  cartItemCount: number;
  
  // Cart UI
  isCartOpen: boolean;
  toggleCart: () => void;
  
  // WhatsApp ordering
  handleWhatsAppOrder: () => void;
  canWhatsAppOrder: boolean;
}

const useMaxTemplate = ({
  products,
  shopName,
  shopContact,
  isWhatsappOrderingEnabled = false,
}: UseMaxTemplateProps): UseMaxTemplateReturn => {
  // Specials swiper state
  const [showSpecialsSwiper, setShowSpecialsSwiper] = useState(false);
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Memoized cart calculations
  const cartItemCount = useMemo(() => {
    return calculateCartItemCount(cartItems);
  }, [cartItems]);

  // Cart management functions
  const addToCart = useCallback((product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  }, []);



  // WhatsApp ordering
  const canWhatsAppOrder = useMemo(() => {
    return isWhatsappOrderingEnabled && !!shopContact && cartItems.length > 0;
  }, [isWhatsappOrderingEnabled, shopContact, cartItems.length]);

  const handleWhatsAppOrder = useCallback(() => {
    if (!canWhatsAppOrder || !shopContact) return;

    try {
      const whatsappUrl = createWhatsAppOrderUrl(cartItems, shopName, shopContact);
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Failed to create WhatsApp order URL:', error);
    }
  }, [canWhatsAppOrder, cartItems, shopName, shopContact]);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeFromCart]);

  // Cart UI functions
  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
  }, []);

  const closeSpecialsSwiper = useCallback(() => {
    setShowSpecialsSwiper(false);
  }, []);

  return {
    // Specials swiper
    showSpecialsSwiper,
    closeSpecialsSwiper,
    
    // Cart management
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartItemCount,
    
    // Cart UI
    isCartOpen,
    toggleCart,
    
    // WhatsApp ordering
    handleWhatsAppOrder,
    canWhatsAppOrder,
  };
};

export default useMaxTemplate;