import React from 'react';
import { MessageCircle, Search } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  shopLogo?: string;
  shopName: string;
}

const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  shopLogo,
  shopName
}) => {
  return (
    <header className="px-3 sm:px-4 md:px-6 lg:px-8 pt-3 sm:pt-4 pb-2 sm:pb-3">
      {/* Shop Info and Contact - Responsive */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 py-1 sm:py-2">
          <div className="flex items-center justify-center rounded-full shadow-lg p-1.5 sm:p-2 shadow-blue-100 border border-gray-200">
            <Image 
              src={shopLogo || "/default-logo.png"} 
              alt={shopName} 
              width={32} 
              height={32}
              className="sm:w-10 sm:h-10 md:w-12 md:h-12"
            />
          </div>
          <span className="text-base sm:text-lg md:text-xl font-semibold text-text truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
            {shopName}
          </span>
        </div>
        <div className="flex items-center justify-center rounded-full shadow-lg p-2 sm:p-3 shadow-gray-200 border border-gray-200 hover:shadow-xl transition-shadow">
          <MessageCircle className='w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-primary transition-colors' />
        </div>
      </div>

      {/* Search Bar - Responsive */}
      <div className="flex items-center bg-background px-2 sm:px-3 py-1 shadow-lg shadow-gray-100 border border-gray-200 rounded-full hover:shadow-xl transition-shadow">
        <div className="flex items-center bg-primary rounded-full p-1.5 sm:p-2 hover:opacity-90 transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <input
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-2 sm:pl-3 pr-2 sm:pr-4 py-2 sm:py-3 bg-transparent text-sm sm:text-base text-text placeholder:text-gray-400 focus:outline-none transition-colors"
          aria-label="Search products"
          role="searchbox"
          autoComplete="off"
        />
        <div className="hidden sm:flex items-center bg-primary rounded-full p-1.5 sm:p-2 px-2 sm:px-4 hover:opacity-90 transition-colors">
          <span className="text-white text-xs sm:text-sm font-semibold">Search</span>
        </div>
      </div>
    </header>
  );
};

export default Header;