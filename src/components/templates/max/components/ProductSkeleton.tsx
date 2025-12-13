import React from 'react';

const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-xl animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-gray-200">
        <div className="absolute bottom-1 left-2 bg-gray-300 px-3 py-2 rounded-3xl w-16 h-8"></div>
        <div className="absolute -bottom-5 right-2 bg-gray-300 rounded-3xl w-12 h-12"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="px-4 py-2">
        <div className="bg-gray-200 h-4 rounded mb-1 w-3/4"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;