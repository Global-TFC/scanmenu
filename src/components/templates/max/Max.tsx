import React, { useState } from 'react';
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

  // Handle category selection with special logic for Specials and Home
  const handleCategorySelect = (category: string) => {
    if (category === 'Specials') {
      setShowSpecialsSwiperState(true);
    } else if (category === 'Home') {
      // Home acts as "All" category
      setHookSelectedCategory('All');
    } else {
      setHookSelectedCategory(category);
    }
  };

  const handleCloseSpecialsSwiper = () => {
    setShowSpecialsSwiperState(false);
  };

  // Combine regular products for display (filtered products are now regular products)
  const filteredProducts = regularProducts;

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
        selected={selectedCategory === 'All' ? 'Home' : selectedCategory}
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-blue-600 shadow-lg flex items-center gap-3 hover:scale-105 transition-transform animate-bounce-in text-white"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="font-semibold">
            {cartItemCount} item{cartItemCount > 1 ? 's' : ''} • ₹{Math.round(cartItems.reduce((sum, item) => sum + (item.offerPrice || item.price) * item.quantity, 0))}
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