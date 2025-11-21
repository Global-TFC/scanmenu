"use client";

import { Menu, Search, Bell, Settings, User } from "lucide-react";

interface TopBarProps {
  onMobileMenuClick: () => void;
  onDesktopMenuClick: () => void;
  shopName?: string;
  shopLogo?: string;
}

export default function TopBar({ onMobileMenuClick, onDesktopMenuClick, shopName, shopLogo }: TopBarProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={onDesktopMenuClick}
            className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            {shopLogo ? (
              <img 
                src={shopLogo} 
                alt={shopName} 
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : null}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{shopName || "Admin Dashboard"}</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Manage your products and shop</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings size={20} className="text-gray-600" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <User className="text-white" size={18} />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">admin@scanmenu.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

