"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Normal from "@/components/templates/normal/Normal";
import { fetchMenuBySlug, fetchMenuItems } from "@/lib/api/menus";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  rating?: number;
  reviews?: number;
}

export default function SlugMenuPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [shopName, setShopName] = useState("");
  const [shopPlace, setShopPlace] = useState("");
  const [shopContact] = useState("+");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = String(slug ?? "");
    if (!s) return;
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);
      setError(null);
      try {
        const [menu, items] = await Promise.all([fetchMenuBySlug(s), fetchMenuItems(s)]);
        if (!active) return;
        setShopName(String(menu?.title ?? ""));
        setShopPlace(String(menu?.summary ?? ""));
        const list = (items as Array<Record<string, unknown>>).map((it) => ({
          id: String(it.id ?? ""),
          name: String(it.name ?? "Item"),
          category: String(it.description ?? ""),
          description: String(it.description ?? ""),
          price: typeof it.price === "number" ? Number(it.price) : 0,
          image: String(
            (it.image as string) ??
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop"
          ),
          rating: 4.6,
          reviews: 0,
        }));
        setProducts(list);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return <Normal shopName={shopName} shopPlace={shopPlace} shopContact={shopContact} products={products} />;
}