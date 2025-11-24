'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Store, Plus, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ReadymadeShop {
  id: string;
  shopName: string;
  slug: string;
  createdAt: string;
}

export default function DeveloperAdmin() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [shops, setShops] = useState<ReadymadeShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    slug: '',
    template: 'PRO'
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (!isPending && (!session || session.user.email !== 'asayn.com@gmail.com')) {
      router.push('/');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await fetch('/api/readymade-shops');
      if (res.ok) {
        const data = await res.json();
        setShops(data);
      }
    } catch (error) {
      console.error("Failed to fetch shops", error);
    } finally {
      setIsLoading(false);
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
                <h2 className="text-xl font-semibold text-gray-900">Active Readymade Shops</h2>
              </div>
              
              {shops.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No readymade shops created yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {shops.map((shop) => (
                    <div key={shop.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div>
                        <h3 className="font-semibold text-gray-900">{shop.shopName}</h3>
                        <p className="text-sm text-gray-500">/{shop.slug}</p>
                        <p className="text-xs text-gray-400 mt-1">Created: {new Date(shop.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/${shop.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                          title="View Shop"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </Link>
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
