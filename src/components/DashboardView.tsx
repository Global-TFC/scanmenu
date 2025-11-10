"use client";

import { Package, Store, LayoutDashboard, Plus } from "lucide-react";
import { Product } from "../app/admin/types";

interface DashboardViewProps {
  products: Product[];
  categories: string[];
  onMenuChange: (menuId: string) => void;
}

export default function DashboardView({ products, categories, onMenuChange }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Package className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{categories.length - 1}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Store className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Shop Status</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">Active</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onMenuChange("products")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Plus className="text-indigo-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add New Product</p>
                <p className="text-sm text-gray-500">Create a new product listing</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => onMenuChange("shop")}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Store className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Update Shop Details</p>
                <p className="text-sm text-gray-500">Edit your shop information</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Menu Tools moved to its own section/view */}
    </div>
  );
}

