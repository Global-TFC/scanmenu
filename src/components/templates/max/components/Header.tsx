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
    <header className="px-4 pt-4 pb-2 sticky -top-20 z-40">
      {/* Search Bar Only */}
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2 py-2">
          <div className="flex items-center justify-center rounded-full shadow-lg p-2 shadow-blue-100 border border-gray-200">
            <Image src={shopLogo || "/default-logo.png"} alt="" width={40} height={40} />
          </div>
          <span className="text-lg font-semibold">{shopName}</span>
        </div>
        <div className="flex items-center justify-center rounded-full shadow-lg p-3 shadow-blue-100 border border-gray-200">
          {/* <div className="rounded-l-full px-2 py-1 pr-4 -mr-3 text-white text-sm font-semibold bg-green-600">
            <span>Order Now</span>
          </div> */}
          <MessageCircle className='w-6 h-6 text-gray-400' />
          {/* <Image src="/whatsapp1.png" className='drop-shadow-lg drop-shadow-blue-100 rounded-full border border-gray-200' alt="" width={40} height={40} /> */}
        </div>
      </div>
      <div className="flex items-center bg-white px-3 py-1 shadow-lg shadow-blue-100 border border-gray-200 rounded-full">
        <div className="flex items-center bg-blue-500 rounded-full p-2 ">
          <Search className="w-5 h-5 text-white" />
        </div>
        <input
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-3 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none active:outline-none onfocus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-colors"
        />
        <div className="flex items-center bg-blue-500 rounded-full p-2 px-4 ">
          <span className="text-white text-m font-semibold">Search</span>
        </div>
      </div>
      {/* <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-colors"
        />
      </div> */}
    </header>
  );
};

export default Header;