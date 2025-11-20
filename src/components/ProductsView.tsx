import Image from "next/image";
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
import ImageUpload from "./ImageUpload";

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
  const [offerPrice, setOfferPrice] = useState("");

  // Menu scanning states
  const [showScanModal, setShowScanModal] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [extractedMenu, setExtractedMenu] = useState<ExtractedMenu | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editNewCategoryMode, setEditNewCategoryMode] = useState(false);
  const [editNewCategoryName, setEditNewCategoryName] = useState("");
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editOfferPrice, setEditOfferPrice] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const availableCategories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

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
    const finalCategory = newCategoryMode ? newCategoryName || "Uncategorized" : category || "Uncategorized";
    onAddProduct({
      name: productName,
      category: finalCategory,
      price: parseFloat(price),
      image:
        productImage || "/default-product.png",
      offerPrice: offerPrice ? parseFloat(offerPrice) : undefined,
    });
    setProductName("");
    setCategory("");
    setPrice("");
    setProductImage("");
    setNewCategoryMode(false);
    setNewCategoryName("");
    setShowAddProduct(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditCategory(product.category);
    setEditPrice(String(product.price));
    setEditImage(product.image);
    setEditIsFeatured(Boolean(product.isFeatured));
    setEditOfferPrice(product.offerPrice ? String(product.offerPrice) : "");
    setShowEditModal(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmEdit = () => {
    if (!editingProduct) return;
    const finalEditCategory = editNewCategoryMode
      ? editNewCategoryName || editingProduct.category
      : editCategory || editingProduct.category;
    const updated: Product = {
      id: editingProduct.id,
      name: editName || editingProduct.name,
      category: finalEditCategory,
      price: parseFloat(editPrice || String(editingProduct.price)),
      image: editImage || editingProduct.image,
      isFeatured: editIsFeatured,
      offerPrice: editOfferPrice ? parseFloat(editOfferPrice) : undefined,
    };
    onEditProduct(updated);
    setShowEditModal(false);
    setEditingProduct(null);
    setEditNewCategoryMode(false);
    setEditNewCategoryName("");
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    onDeleteProduct(deletingId);
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new window.Image();
      img.onload = () => {
        // Compress and resize image
        const canvas = document.createElement('canvas');
        const maxWidth = 1024;
        const maxHeight = 1024;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression (0.7 quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setImage(compressedBase64);
      };
      img.src = reader.result as string;
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
            "/default-product.png",
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
              <div className="space-y-2">
                <select
                  value={newCategoryMode ? "__new__" : category}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "__new__") {
                      setNewCategoryMode(true);
                      setCategory("");
                    } else {
                      setNewCategoryMode(false);
                      setCategory(v);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="">Select Category</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__new__">Create New Category</option>
                </select>
                {newCategoryMode && (
                  <input
                    type="text"
                    placeholder="New Category Name *"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                )}
                {availableCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map((cat) => (
                      <span key={cat} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="number"
                placeholder="Price *"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <input
                type="number"
                placeholder="Offer Price (optional)"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                step="0.01"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <ImageUpload
                  onSuccess={(url) => setProductImage(url)}
                  currentImage={productImage}
                />
              </div>
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
        <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4">
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
                  <Image
                    src={image}
                    alt="Menu preview"
                    width={500}
                    height={500}
                    style={{ width: '100%', height: 'auto' }}
                    className="rounded-lg shadow-md"
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

      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
              <button onClick={cancelEdit} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <div className="space-y-2">
                <select
                  value={editNewCategoryMode ? "__new__" : editCategory}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "__new__") {
                      setEditNewCategoryMode(true);
                      setEditCategory("");
                    } else {
                      setEditNewCategoryMode(false);
                      setEditCategory(v);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="">Select Category</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__new__">Create New Category</option>
                </select>
                {editNewCategoryMode && (
                  <input
                    type="text"
                    placeholder="New Category Name *"
                    value={editNewCategoryName}
                    onChange={(e) => setEditNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                )}
                {availableCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map((cat) => (
                      <span key={cat} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                step="0.01"
                placeholder="Price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <input
                type="number"
                value={editOfferPrice}
                onChange={(e) => setEditOfferPrice(e.target.value)}
                step="0.01"
                placeholder="Offer Price (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                <ImageUpload
                  onSuccess={(url) => setEditImage(url)}
                  currentImage={editImage}
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={editIsFeatured}
                  onChange={(e) => setEditIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Featured (show in Flash Deals)
              </label>
            </div>
            <div className="p-6 flex gap-3 border-t border-gray-200">
              <button onClick={confirmEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                Save Changes
              </button>
              <button onClick={cancelEdit} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Delete Product</h3>
              <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete this product?</p>
            </div>
            <div className="p-6 flex gap-3">
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                Delete
              </button>
              <button onClick={cancelDelete} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
