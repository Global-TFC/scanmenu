"use client";

import { Edit2, Trash2 } from "lucide-react";
import { Product } from "../app/admin/types";

interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, viewMode, onEdit, onDelete }: ProductCardProps) {
  if (viewMode === "grid") {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img 
            src={product.image || "/default-product.png"} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{product.name}</h3>
            <span className="text-indigo-600 font-bold text-base sm:text-lg">
              ₹{(typeof product.offerPrice === "number" && product.offerPrice < product.price ? product.offerPrice : product.price).toFixed(2)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">{product.category}</p>
          {typeof product.offerPrice === "number" && product.offerPrice < product.price && (
            <p className="text-xs text-gray-500">
              <span className="line-through">₹{product.price.toFixed(2)}</span>
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-3 sm:py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-xs sm:text-sm font-medium"
            >
              <Edit2 size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Edit</span>
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-3 sm:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium"
            >
              <Trash2 size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-center p-3 sm:p-4 gap-3 sm:gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <img 
            src={product.image || "/default-product.png"} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{product.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500">{product.category}</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-indigo-600 font-bold text-base sm:text-xl whitespace-nowrap">₹{(typeof product.offerPrice === "number" && product.offerPrice < product.price ? product.offerPrice : product.price).toFixed(2)}</span>
            {typeof product.offerPrice === "number" && product.offerPrice < product.price && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">₹{product.price.toFixed(2)}</span>
            )}
          </div>
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              title="Edit"
            >
              <Edit2 size={16} className="sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

