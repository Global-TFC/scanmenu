"use client";

import { useState } from "react";
import { Plus, Search, Grid3x3, List, Store } from "lucide-react";
import { Product } from "../app/admin/types";
import ProductCard from "./ProductCard";

interface ProductsViewProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, "id">) => void;
  onDeleteProduct: (id: string) => void;
  onEditProduct: (product: Product) => void;
}

export default function ProductsView({
  products,
  onAddProduct,
  onDeleteProduct,
  onEditProduct,
}: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [productImage, setProductImage] = useState("");

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    if (!productName || !category || !price) {
      alert("Please fill in all required fields");
      return;
    }
    onAddProduct({
      name: productName,
      category,
      price: parseFloat(price),
      image: productImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop",
    });
    setProductName("");
    setCategory("");
    setPrice("");
    setProductImage("");
    setShowAddProduct(false);
  };

  const handleEdit = (product: Product) => {
    alert("Edit functionality would open a modal to edit this product");
    onEditProduct(product);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      onDeleteProduct(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Product Management</h2>
          <div className="flex gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow-sm text-indigo-600" : "text-gray-600"} transition-all`}
                title="Grid View"
              >
                <Grid3x3 size={16} className="sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow-sm text-indigo-600" : "text-gray-600"} transition-all`}
                title="List View"
              >
                <List size={16} className="sm:w-4 sm:h-4" />
              </button>
            </div>
            <button
              onClick={() => setShowAddProduct(!showAddProduct)}
              className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm"
            >
              <Plus size={16} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddProduct && (
        <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Product Name *"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <input
              type="text"
              placeholder="Category *"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <input
              type="number"
              placeholder="Price *"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <input
              type="text"
              placeholder="Image URL (optional)"
              value={productImage}
              onChange={(e) => setProductImage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Add Product
              </button>
              <button
                onClick={() => setShowAddProduct(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="p-4 sm:p-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block p-3 sm:p-4 bg-gray-100 rounded-full mb-4">
              <Store className="text-gray-400 mx-auto" size={32} />
            </div>
            <p className="text-gray-500 text-base sm:text-lg">No products found</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Try adjusting your search or filter</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

