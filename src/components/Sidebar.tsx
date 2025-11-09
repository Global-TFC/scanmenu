"use client";

import { Store, ShoppingBag, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { Product } from "../app/admin/types";

interface SidebarProps {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  menuItems: MenuItem[];
  activeMenu: string;
  onMenuClick: (menuId: string) => void;
  onCloseMobile: () => void;
}

export default function Sidebar({
  sidebarOpen,
  mobileSidebarOpen,
  menuItems,
  activeMenu,
  onMenuClick,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo Section */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Store className="text-white" size={20} />
              </div>
              <span className="font-bold text-lg text-gray-900">ScanMenu</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
              <Store className="text-white" size={20} />
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onMenuClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      item.active
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
                    {sidebarOpen && item.active && <ChevronRight size={16} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 p-4">
          <Link href="/menu/shop-123">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <ShoppingBag size={20} />
              {sidebarOpen && <span className="flex-1 text-left">View Menu</span>}
            </button>
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onCloseMobile}
          />
          <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 lg:hidden overflow-y-auto">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Store className="text-white" size={20} />
                </div>
                <span className="font-bold text-lg text-gray-900">ScanMenu</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="py-4">
              <ul className="space-y-1 px-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          onMenuClick(item.id);
                          onCloseMobile();
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          item.active
                            ? 'bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.active && <ChevronRight size={16} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="border-t border-gray-200 p-4">
              <Link href="/menu/shop-123">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <ShoppingBag size={20} />
                  <span className="flex-1 text-left">View Menu</span>
                </button>
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

