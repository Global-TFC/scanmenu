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
    <div className="w-full z-30 overflow-x-auto scrollbar-hide py-2 sm:py-3 rounded-b-2xl backdrop-blur-sm">
      <div className="flex gap-3 sm:gap-4 md:gap-5 px-3 sm:px-4 md:px-6 lg:px-8 min-w-max">
        {categoryBubbles.map((category) => {
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className="flex flex-col items-center gap-1.5 sm:gap-2 group min-w-[50px] sm:min-w-[60px] md:min-w-[70px] hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              {/* Story ring - Responsive sizes */}
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full p-[2px] sm:p-[3px] transition-all duration-200 shadow-lg shadow-blue-100 border border-gray-200 ${category.isSpecial
                  ? 'bg-blue-500 border-2 border-blue-500'
                  : category.isActive
                    ? 'bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500'
                    : 'bg-gray-200 group-hover:bg-gray-300'
                  }`}
              >
                {/* Inner circle with image or placeholder */}
                <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.label}
                      className="w-full p-1 sm:p-2 h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Show fallback content
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span class="text-gray-600 font-semibold text-sm sm:text-lg">
                                ${category.label.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : category.isSpecial ? (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm sm:text-lg">⚡</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-sm sm:text-lg">
                        {category.label.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Label - Responsive text */}
              <span
                className={`text-xs sm:text-sm font-medium transition-colors duration-200 text-center max-w-[50px] sm:max-w-[60px] md:max-w-[70px] truncate ${category.isActive ? 'text-gray-900 font-semibold' : 'text-gray-600'
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