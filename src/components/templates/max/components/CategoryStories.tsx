import React from 'react';

interface CategoryWithImage {
  id: string;
  name: string;
  image?: string;
}

interface CategoryStoriesProps {
  categories: string[];
  categoriesWithImages: CategoryWithImage[];
  selected: string;
  onSelect: (category: string) => void;
  shopLogo?: string;
  shopName: string;
  featuredProductsCount: number;
}

interface CategoryBubble {
  id: string;
  label: string;
  image?: string;
  isActive: boolean;
  isSpecial?: boolean;
}

const CategoryStories: React.FC<CategoryStoriesProps> = ({
  categories,
  categoriesWithImages,
  selected,
  onSelect,
  shopLogo,
  shopName,
  featuredProductsCount,
}) => {
  // Helper function to get category image
  const getCategoryImage = (categoryName: string): string | undefined => {
    const categoryWithImage = categoriesWithImages.find(cat => cat.name === categoryName);
    return categoryWithImage?.image;
  };

  // Create category bubbles with "All" first, then "Specials", then categories
  const categoryBubbles: CategoryBubble[] = [
    {
      id: 'All',
      label: 'All',
      image: shopLogo, // Show shop logo for All category
      isActive: selected === 'All',
    },
    ...(featuredProductsCount > 0 ? [{
      id: 'Specials',
      label: 'Specials',
      image: '/animated-gift-emoji.gif',
      isActive: selected === 'Specials',
      isSpecial: true,
    }] : []),
    ...categories.map((category) => ({
      id: category,
      label: category,
      image: getCategoryImage(category),
      isActive: selected === category,
    })),
  ];

  return (
    <div className="w-full z-30 overflow-x-auto scrollbar-hide py-3 sm:py-3 rounded-b-2xl backdrop-blur-sm">
      <div className="flex gap-2 sm:gap-2 md:gap-3 px-4 sm:px-4 md:px-6 lg:px-8 min-w-max">
        {categoryBubbles.map((category) => {
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className="flex flex-col items-center gap-2 sm:gap-2 group min-w-[60px] sm:min-w-[70px] md:min-w-[80px] hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              {/* Story ring - Increased mobile sizes */}
              <div
                className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-22 lg:h-22 rounded-full p-[3px] sm:p-[3px] transition-all duration-200 shadow-lg shadow-gray-200 border border-gray-200 ${category.isSpecial
                  ? 'bg-primary border-2 border-primary'
                  : category.isActive
                    ? 'bg-primary'
                    : 'bg-gray-200 group-hover:bg-gray-300'
                  }`}
              >
                {/* Inner circle with image or placeholder */}
                <div className="w-full h-full rounded-full overflow-hidden bg-background flex items-center justify-center p-[2px]">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.label}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Show fallback content
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span class="text-gray-600 font-semibold text-base sm:text-lg">
                                ${category.label.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : category.isSpecial ? (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <span className="text-white font-bold text-base sm:text-lg">⚡</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-base sm:text-lg">
                        {category.label.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Label - Responsive text */}
              <span
                className={`text-sm sm:text-sm font-medium transition-colors duration-200 text-center max-w-[60px] sm:max-w-[70px] md:max-w-[80px] truncate ${category.isActive ? 'text-text font-bold' : 'text-text opacity-70'
                  }`}
              >
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryStories;