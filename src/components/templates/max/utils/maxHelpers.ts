import { Product } from '@/hooks/use-products';

/**
 * Utility functions for the Max template
 */

export interface CartItem extends Product {
  quantity: number;
}

/**
 * Calculate the total price of cart items
 */
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const itemPrice = item.offerPrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
};

/**
 * Calculate the total number of items in cart
 */
export const calculateCartItemCount = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Filter products by search query
 */
export const filterProductsBySearch = (products: Product[], searchQuery: string): Product[] => {
  if (!searchQuery.trim()) return products;
  
  const query = searchQuery.toLowerCase();
  return products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query)
  );
};

/**
 * Filter products by category
 */
export const filterProductsByCategory = (products: Product[], category: string): Product[] => {
  if (category === 'All') return products;
  return products.filter(product => product.category === category);
};

/**
 * Get unique categories from products
 */
export const getUniqueCategories = (products: Product[]): string[] => {
  const categories = products
    .map(product => product.category)
    .filter(Boolean)
    .filter((category, index, array) => array.indexOf(category) === index);
  
  return categories.sort();
};

/**
 * Generate WhatsApp order message
 */
export const generateWhatsAppMessage = (
  cartItems: CartItem[],
  shopName: string
): string => {
  const orderText = cartItems
    .map(item => {
      const itemPrice = item.offerPrice || item.price;
      return `${item.name} x${item.quantity} - ₹${itemPrice * item.quantity}`;
    })
    .join('\n');
  
  const total = calculateCartTotal(cartItems);
  
  return `Hi ${shopName}!\n\nI'd like to order:\n\n${orderText}\n\nTotal: ₹${total}\n\nThank you!`;
};

/**
 * Format WhatsApp contact number
 */
export const formatWhatsAppNumber = (contactNumber: string): string => {
  // Remove all non-digit characters
  return contactNumber.replace(/\D/g, '');
};

/**
 * Create WhatsApp order URL
 */
export const createWhatsAppOrderUrl = (
  cartItems: CartItem[],
  shopName: string,
  contactNumber: string
): string => {
  const message = generateWhatsAppMessage(cartItems, shopName);
  const formattedNumber = formatWhatsAppNumber(contactNumber);
  
  return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
};

/**
 * Debounce function for search input
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Check if an image URL is valid
 */
export const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get fallback image URL
 */
export const getFallbackImageUrl = (): string => {
  return '/default-product.png';
};

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  return `₹${price.toFixed(0)}`;
};

/**
 * Check if product has an offer
 */
export const hasOffer = (product: Product): boolean => {
  return !!(product.offerPrice && product.offerPrice < product.price);
};

/**
 * Get display price (offer price if available, otherwise regular price)
 */
export const getDisplayPrice = (product: Product): number => {
  return product.offerPrice || product.price;
};