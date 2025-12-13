import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useProducts, Product } from '@/hooks/use-products';
import Header from './components/Header';
import CategoryStories from './components/CategoryStories';
import FoodGrid from './components/FoodGrid';
import OrderCart from './components/OrderCart';
import SpecialsSwiper from './components/SpecialsSwiper';
import OptimizedCartButton from './components/OptimizedCartButton';
import MaxErrorBoundary from './components/MaxErrorBoundary';
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

  // Track debounced search term to match the hook's internal logic
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  // Debounce search term to match useProducts hook behavior
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
  const handleCategorySelect = useCallback((category: string) => {
    if (category === 'Specials') {
      setShowSpecialsSwiperState(true);
    } else if (category === 'All') {
      // All category shows all products
      setHookSelectedCategory('All');
    } else {
      setHookSelectedCategory(category);
    }
  }, [setHookSelectedCategory]);

  const handleCloseSpecialsSwiper = useCallback(() => {
    setShowSpecialsSwiperState(false);
  }, []);

  // Combine products for display based on selected category and search
  // For "All" without search: show only regular products (non-featured)
  // For "All" with search: show both featured and regular products
  // For specific categories: show both featured and regular products from that category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
        // When searching from "All", show both featured and regular products
        return products;
      } else {
        // When browsing "All" without search, show only regular (non-featured) products
        return regularProducts;
      }
    } else {
      // Show both featured and regular products from the selected category
      return products;
    }
  }, [selectedCategory, debouncedSearchTerm, regularProducts, products]);

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
    <MaxErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header with search only - Responsive */}
        <div className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur-sm">
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            shopLogo={shopLogo}
            shopName={shopName}
          />
        </div>

        {/* Category Stories - Responsive horizontal scroll */}
        <div className="sticky top-[120px] sm:top-[130px] md:top-[140px] z-30 bg-gray-50/95 backdrop-blur-sm">
          <CategoryStories
            categories={filteredCategories}
            categoriesWithImages={categoriesWithImages}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
            shopLogo={shopLogo}
            shopName={shopName}
            featuredProductsCount={featuredProducts.length}
          />
        </div>

        {/* Food Grid - Responsive grid layout */}
        <div className="flex-1 pb-20 sm:pb-24 md:pb-28 lg:pb-32">
          <FoodGrid
            items={filteredProducts}
            onAddToCart={addToCart}
            hasMore={hasMore}
            loading={regularLoading}
            loadMoreRef={loadMoreRef}
            error={regularError}
            onRetry={retryRegularProducts}
            searchTerm={debouncedSearchTerm}
          />
        </div>

        {/* Optimized Bottom Cart Button - Responsive positioning */}
        <OptimizedCartButton
          cartItems={cartItems}
          cartItemCount={cartItemCount}
          isCartOpen={isCartOpen}
          onToggleCart={toggleCart}
        />

        {/* Order Cart Modal - Responsive sizing */}
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
    </MaxErrorBoundary>
  );
};

export default Max;