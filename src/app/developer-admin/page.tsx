'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Store, Plus, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ProductsView from '@/components/ProductsView';
import CategoriesView from '@/components/CategoriesView';

interface ReadymadeShop {
  id: string;
  shopName: string;
  slug: string;
  createdAt: string;
}

export default function DeveloperAdmin() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [shops, setShops] = useState<any[]>([]); // Using any for flexibility or improved type later
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    slug: '',
    template: 'PRO'
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Product Management State
  const [managingShop, setManagingShop] = useState<any | null>(null); // Shop being managed
  const [managingMode, setManagingMode] = useState<'products' | 'categories'>('products');
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    if (!isPending && (!session || session.user.email !== 'asayn.com@gmail.com')) {
      router.push('/');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    if (managingShop) {
      fetchShopProducts(managingShop.slug);
    }
  }, [managingShop]);

  const fetchShops = async () => {
    try {
      const res = await fetch('/api/developer/shops');
      if (res.ok) {
        const data = await res.json();
        setShops(data);
      } else {
        console.error("Fetch shops failed:", res.status);
        setMessage({ type: 'error', text: `Failed to load shops` });
      }
    } catch (error) {
      console.error("Failed to fetch shops", error);
      setMessage({ type: 'error', text: "Network error fetching shops" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShopProducts = async (slug: string) => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch(`/api/developer/shops/${slug}/items`);
      if (res.ok) {
        const data = await res.json();
        setShopProducts(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setMessage(null);

    try {
      const res = await fetch('/api/developer/create-readymade-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `Shop "${data.shopName}" created successfully!` });
        setFormData({ shopName: '', slug: '', template: 'PRO' });
        fetchShops();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create shop' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteShop = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete shop: ${slug}? This cannot be undone.`)) return;

    try {
      const res = await fetch('/api/developer/shops', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      });

      if (res.ok) {
        setShops(shops.filter(s => s.slug !== slug));
        if (managingShop?.slug === slug) setManagingShop(null);
      } else {
        alert('Failed to delete shop');
      }
    } catch (error) {
       console.error("Delete error", error);
       alert('Error deleting shop');
    }
  };

  // Product Handlers
  const handleAddProduct = async (product: any) => {
    if (!managingShop) return;
    try {
      const res = await fetch(`/api/developer/shops/${managingShop.slug}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        fetchShopProducts(managingShop.slug);
      } else {
        alert("Failed to add product");
      }
    } catch (error) {
      console.error(error);
      alert("Error adding product");
    }
  };      

  const handleEditProduct = async (product: any) => {
    if (!managingShop) return;
    try {
      const res = await fetch(`/api/developer/shops/${managingShop.slug}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product) // includes id
      });
      if (res.ok) {
        fetchShopProducts(managingShop.slug);
      } else {
        alert("Failed to edit product");
      }
    } catch (error) {
       console.error(error);
      alert("Error editing product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!managingShop) return;
    try {
       const res = await fetch(`/api/developer/shops/${managingShop.slug}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchShopProducts(managingShop.slug);
      } else {
         alert("Failed to delete product");
      }
    } catch (error) {
       console.error(error);
      alert("Error deleting product");
    }
  };

  const handleBulkUpload = async (items: any[]) => {
      // Not implemented for developer admin yet, or can reuse existing bulk logic if adapted
      alert("Bulk upload not implemented in dev admin yet.");
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!session || session.user.email !== 'asayn.com@gmail.com') {
    return null; // Will redirect in useEffect
  }

  if (managingShop) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
         <div className="max-w-7xl mx-auto">
            <button 
                onClick={() => { setManagingShop(null); setManagingMode('products'); }}
                className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
            >
                ← Back to Shops
            </button>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Managing: <span className="text-indigo-600">{managingShop.shopName}</span>
                </h1>
                 <div className="flex items-center gap-4">
                   <div className="text-sm text-gray-500">
                     Slug: {managingShop.slug}
                   </div>
                   <div className="flex bg-gray-100 rounded-lg p-1">
                     <button
                       onClick={() => setManagingMode('products')}
                       className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                         managingMode === 'products'
                           ? 'bg-white shadow text-indigo-600'
                           : 'text-gray-600 hover:text-gray-900'
                       }`}
                     >
                       Products
                     </button>
                     <button
                       onClick={() => setManagingMode('categories')}
                       className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                         managingMode === 'categories'
                           ? 'bg-white shadow text-indigo-600'
                           : 'text-gray-600 hover:text-gray-900'
                       }`}
                     >
                       Categories
                     </button>
                   </div>
                 </div>
            </div>

            {managingMode === 'products' && (
              isLoadingProducts ? (
                   <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                   </div>
              ) : (
                  <ProductsView 
                      products={shopProducts}
                      slug={managingShop.slug}
                      onAddProduct={handleAddProduct}
                      onEditProduct={handleEditProduct}
                      onDeleteProduct={handleDeleteProduct}
                      onBulkUpload={handleBulkUpload}
                  />
              )
            )}

            {managingMode === 'categories' && (
              <CategoriesView 
                slug={managingShop.slug} 
                apiBasePath="/api/developer/shops" 
              />
            )}
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="text-indigo-600" />
            Developer Admin
          </h1>
          <div className="text-sm text-gray-500">
            Logged in as: <span className="font-medium text-gray-900">{session.user.email}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Readymade Shop</h2>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                  <input
                    type="text"
                    required
                    value={formData.shopName}
                    onChange={e => setFormData({...formData, shopName: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. Demo Cafe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="demo-cafe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                  <select
                    value={formData.template}
                    onChange={e => setFormData({...formData, template: e.target.value as any})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                  >
                    <option value="PRO">Pro</option>
                    <option value="NORMAL">Normal</option>
                    <option value="E_COM">E-Commerce</option>
                    <option value="CAFE">Cafe</option>
                  </select>
                </div>

                {message && (
                  <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Shop
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Shop List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">All Shops ({shops.length})</h2>
              </div>
              
              {shops.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No shops found.
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-[800px] overflow-y-auto">
                  {shops.map((shop) => (
                    <div key={shop.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{shop.shopName}</h3>
                            {shop.isReadymade && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Readymade</span>}
                        </div>
                        <p className="text-sm text-gray-500">/{shop.slug}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            Owner: {shop.user?.email || 'N/A'} • Created: {new Date(shop.createdAt).toLocaleDateString()}
                        </p>
                         <p className="text-xs text-gray-500 mt-1">Items: {shop._count?.items || 0}</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <button
                            onClick={() => setManagingShop(shop)}
                            className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                         >
                            Manage Products
                         </button>
                        <Link
                          href={`/${shop.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                          title="View Shop"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </Link>
                        <button
                            onClick={() => handleDeleteShop(shop.slug)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Shop"
                        >
                            <span className="sr-only">Delete</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
