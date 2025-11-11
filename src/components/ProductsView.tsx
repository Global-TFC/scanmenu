"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Grid3x3,
  List,
  Store,
  CameraIcon,
  X,
  Upload,
  Check,
} from "lucide-react";
import { Product } from "../app/admin/types";
import ProductCard from "./ProductCard";
import { extractMenuFromImage } from "@/lib/api/menus";

interface MenuItem {
  name: string;
  price: number;
}

interface ExtractedMenu {
  menuItems: MenuItem[];
}

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

  // Menu scanning states
  const [showScanModal, setShowScanModal] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [extractedMenu, setExtractedMenu] = useState<ExtractedMenu | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    if (!productName || !price) {
      alert("Please fill in all required fields");
      return;
    }
    onAddProduct({
      name: productName,
      category: category || "Uncategorized",
      price: parseFloat(price),
      image:
        productImage ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop",
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const extractMenuItems = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const data = await extractMenuFromImage(image);
      setExtractedMenu(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addAllItemsToProducts = async () => {
    if (!extractedMenu) return;

    try {
      for (const item of extractedMenu.menuItems) {
        onAddProduct({
          name: item.name,
          category: "Scanned Menu",
          price: item.price,
          image:
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop",
        });
      }

      alert(`Successfully added ${extractedMenu.menuItems.length} items!`);
      closeScanModal();
    } catch (err) {
      alert(`Failed to add items to products: ${err}`);
    }
  };

  const closeScanModal = () => {
    setShowScanModal(false);
    setImage(null);
    setExtractedMenu(null);
    setError(null);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Section Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Product Management
            </h2>
            <div className="flex gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-indigo-600"
                      : "text-gray-600"
                  } transition-all`}
                  title="Grid View"
                >
                  <Grid3x3 size={16} className="sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-indigo-600"
                      : "text-gray-600"
                  } transition-all`}
                  title="List View"
                >
                  <List size={16} className="sm:w-4 sm:h-4" />
                </button>
              </div>
              <button
                onClick={() => setShowScanModal(true)}
                className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm border border-gray-300"
                title="Scan Product"
              >
                <CameraIcon size={16} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Scan</span>
              </button>
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
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
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
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
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
              <p className="text-gray-500 text-base sm:text-lg">
                No products found
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">
                Try adjusting your search or filter
              </p>
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

      {/* Scan Menu Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Scan Menu</h3>
              <button
                onClick={closeScanModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Image Upload */}
              {!image && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="menu-upload"
                  />
                  <label
                    htmlFor="menu-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="text-gray-400 mb-3" size={48} />
                    <span className="text-gray-700 font-medium mb-1">
                      Upload Menu Image
                    </span>
                    <span className="text-sm text-gray-500">
                      Click to upload or take a photo
                    </span>
                  </label>
                </div>
              )}

              {/* Preview Image */}
              {image && !extractedMenu && (
                <div className="space-y-4">
                  <img
                    src={image}
                    alt="Menu preview"
                    className="w-full rounded-lg shadow-md"
                  />
                  <button
                    onClick={extractMenuItems}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-medium"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Extracting Menu...
                      </span>
                    ) : (
                      "Extract Menu Items"
                    )}
                  </button>
                  <button
                    onClick={() => setImage(null)}
                    className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Choose Different Image
                  </button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              {/* Extracted Menu */}
              {extractedMenu && (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-900">
                      Menu Items Extracted
                    </h4>
                    <p className="text-sm text-indigo-700 mt-1">
                      Found {extractedMenu.menuItems.length} items
                    </p>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {extractedMenu.menuItems.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium text-gray-900">
                            {item.name}
                          </h5>
                          <span className="font-semibold text-green-600 ml-4">
                            ₹{item.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={addAllItemsToProducts}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Check size={20} />
                      Add All to Products
                    </button>
                    <button
                      onClick={() => {
                        setImage(null);
                        setExtractedMenu(null);
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Scan Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
