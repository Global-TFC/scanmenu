"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag, X, Loader2, Image as ImageIcon } from "lucide-react";
import ImageUpload from "./ImageUpload";

interface Category {
  id: string;
  name: string;
  image: string | null;
  _count?: {
    items: number;
  };
}

interface CategoriesViewProps {
  slug: string;
  apiBasePath?: string; // "/api/menu" or "/api/developer/shops"
}

export default function CategoriesView({ 
  slug, 
  apiBasePath = "/api/menu" 
}: CategoriesViewProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBasePath}/${slug}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      } else {
        setError("Failed to load categories");
      }
    } catch (e) {
      setError("Error loading categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [slug, apiBasePath]);

  const handleCreate = async () => {
    // Temporarily disabled
    alert("Category creation is temporarily disabled for updates.");
    return;
    
    if (!newCategoryName.trim()) return;
    
    setSaving(true);
    const url = `${apiBasePath}/${slug}/categories`;
    console.log("[CategoriesView] Creating category at:", url);
    console.log("[CategoriesView] Data:", { name: newCategoryName.trim(), image: newCategoryImage || null });
    
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newCategoryName.trim(),
          image: newCategoryImage || null 
        }),
      });

      console.log("[CategoriesView] Response status:", res.status);
      const data = await res.json();
      console.log("[CategoriesView] Response data:", data);

      if (res.ok) {
        setShowAddModal(false);
        setNewCategoryName("");
        setNewCategoryImage("");
        fetchCategories();
      } else {
        alert(data.error || "Failed to create category");
      }
    } catch (e) {
      console.error("[CategoriesView] Error:", e);
      alert("Error creating category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingCategory) return;
    
    setSaving(true);
    try {
      const res = await fetch(`${apiBasePath}/${slug}/categories`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCategory.id,
          name: editingCategory.name.trim(),
          image: editingCategory.image,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update category");
      }
    } catch (e) {
      alert("Error updating category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    
    setSaving(true);
    try {
      const res = await fetch(`${apiBasePath}/${slug}/categories`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingCategory.id }),
      });

      if (res.ok) {
        setShowDeleteModal(false);
        setDeletingCategory(null);
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete category");
      }
    } catch (e) {
      alert("Error deleting category");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory({ ...category });
    setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">{error}</div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="text-indigo-600" size={20} />
              Categories ({categories.length})
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={true}
              className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed transition-colors shadow-sm opacity-50"
            >
              <Plus size={18} />
              Add Category (Disabled)
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="p-4 sm:p-6">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No categories yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Create categories to organize your products
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors group"
                >
                  {category.image ? (
                    <div className="w-full h-24 rounded-lg overflow-hidden mb-3">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-3">
                      <Tag className="text-indigo-400" size={32} />
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-gray-900 truncate">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {category._count?.items || 0} products
                  </p>
                  
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(category)}
                      className="flex-1 py-1.5 px-3 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-1"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(category)}
                      className="py-1.5 px-3 text-sm bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Add Category</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Beverages"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image (optional)
                </label>
                <ImageUpload
                  onSuccess={(url) => setNewCategoryImage(url)}
                  currentImage={newCategoryImage}
                  defaultSearchTerm={newCategoryName}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleCreate}
                disabled={saving || !newCategoryName.trim()}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                Create Category
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Edit Category</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image
                </label>
                <ImageUpload
                  onSuccess={(url) =>
                    setEditingCategory({ ...editingCategory, image: url })
                  }
                  currentImage={editingCategory.image || ""}
                  defaultSearchTerm={editingCategory.name}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleEdit}
                disabled={saving || !editingCategory.name.trim()}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : null}
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Delete Category</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete "{deletingCategory.name}"?
              </p>
              {(deletingCategory._count?.items || 0) > 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  ⚠️ This category has {deletingCategory._count?.items} products. They will be unlinked.
                </p>
              )}
            </div>
            <div className="p-6 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
