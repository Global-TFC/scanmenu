import React, { useState, useMemo } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useProducts, Product } from '@/hooks/use-products';
import Header from './components/Header';
import CategoryStories from './components/CategoryStories';
import FoodGrid from './components/FoodGrid';
import OrderCart from './components/OrderCart';
import SpecialsSwiper from './components/SpecialsSwiper';
import useMaxTemplate from './hooks/useMaxTemplate';
import useCategories from './hooks/useCategories';
import './styles/max.css';

interface MaxProps {
  shopName: string;
  shopPlace: string;
  shopContact: string;
  shopLogo?: string;
  products: Product[];
  isWhatsappOrderingEnabled?: boolean;
  slug: string;
}

const Max: React.FC<MaxProps> = ({
  shopName,
  shopPlace,
  shopContact,
  shopLogo,
  products: initialProducts,
  isWhatsappOrderingEnabled = false,
  slug,
}) => {
  // Use the existing useProducts hook for data management with infinite scroll
  const {
    featuredProducts: hookFeaturedProducts,
    featuredLoading,
    featuredError,
    regularProducts,
    regularLoading,
    regularError,
    hasMore,
    loadMoreRef,
    searchTerm,
    setSearchTerm,
    selectedCategory: hookSelectedCategory,
    setSelectedCategory: setHookSelectedCategory,
    categories: hookCategories,
    retryRegularProducts,
    products, // Legacy support for backward compatibility
    loading: productsLoading,
  } = useProducts({
    initialProducts,
    slug,
  });

  // Fetch categories with images
  const { categories: categoriesWithImages, loading: categoriesLoading, error: categoriesError } = useCategories({
    slug,
  });

  // Use the Max template specific hook
  const {
    showSpecialsSwiper,
    closeSpecialsSwiper,
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartItemCount,
    isCartOpen,
    toggleCart,
    handleWhatsAppOrder,
    canWhatsAppOrder,
  } = useMaxTemplate({
    products,
    shopName,
    shopContact,
    isWhatsappOrderingEnabled,
  });

  // Add state for specials swiper
  const [showSpecialsSwiperState, setShowSpecialsSwiperState] = useState(false);

  // Use search and category from useProducts hook
  const searchQuery = searchTerm;
  const setSearchQuery = setSearchTerm;
  const selectedCategory = hookSelectedCategory;
  const featuredProducts = hookFeaturedProducts;

  // Filter out "All" from categories since shop name acts as "All"
  const filteredCategories = hookCategories.filter(cat => cat !== 'All');

  // Handle category selection with special logic for Specials and All
  const handleCategorySelect = (category: string) => {
    if (category === 'Specials') {
      setShowSpecialsSwiperState(true);
    } else if (category === 'All') {
      // All category shows all products
      setHookSelectedCategory('All');
    } else {
      setHookSelectedCategory(category);
    }
  };

  const handleCloseSpecialsSwiper = () => {
    setShowSpecialsSwiperState(false);
  };

  // Combine products for display based on selected category
  // For "All": show only regular products (non-featured)
  // For specific categories: show both featured and regular products from that category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      // Show only regular (non-featured) products
      return regularProducts;
    } else {
      // Show both featured and regular products from the selected category
      return products;
    }
  }, [selectedCategory, regularProducts, products]);

  const loading = (featuredLoading && regularLoading) || categoriesLoading;
  const error = categoriesError;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600">Failed to load menu</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with search only */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        shopLogo={shopLogo}
        shopName={shopName}
      />

      {/* Category Stories - Shop name first, then Specials, then categories */}
      <CategoryStories
        categories={filteredCategories}
        categoriesWithImages={categoriesWithImages}
        selected={selectedCategory}
        onSelect={handleCategorySelect}
        shopLogo={shopLogo}
        shopName={shopName}
        featuredProductsCount={featuredProducts.length}
      />

      {/* Food Grid */}
      <div className="flex-1 pb-10">
        <FoodGrid
          items={filteredProducts}
          onAddToCart={addToCart}
          hasMore={hasMore}
          loading={regularLoading}
          loadMoreRef={loadMoreRef}
          error={regularError}
          onRetry={retryRegularProducts}
        />
      </div>

      {/* Bottom Cart Button - Only show if items in cart */}
      {cartItemCount > 0 && !isCartOpen && (
        <button
          onClick={toggleCart}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 
             px-5 py-3.5 rounded-full bg-blue-600 text-white shadow-2xl 
             flex items-center gap-3 hover:scale-105 active:scale-95 
             transition-all duration-200 animate-bounce-in
             whitespace-nowrap min-w-max" // ← Key fixes
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {/* Optional: little badge for count */}
            {/* {cartItemCount > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
        {cartItemCount}
      </span>
    )} */}
          </div>

          <span className="font-semibold text-sm md:text-base flex items-center gap-2">
            <span>
              {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
            </span>
            <span className="font-bold">
              ₹{Math.round(cartItems.reduce((sum, item) => sum + (item.offerPrice || item.price) * item.quantity, 0))}
            </span>
          </span>
        </button>
      )}



      {/* Order Cart Modal */}
      <OrderCart
        items={cartItems}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        isOpen={isCartOpen}
        onToggle={toggleCart}
        onWhatsAppOrder={canWhatsAppOrder ? handleWhatsAppOrder : undefined}
        canWhatsApp={canWhatsAppOrder}
      />

      {/* Specials Swiper - Full screen Tinder-like interface */}
      {showSpecialsSwiperState && featuredProducts.length > 0 && (
        <SpecialsSwiper
          featuredProducts={featuredProducts}
          onClose={handleCloseSpecialsSwiper}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

export default Max;