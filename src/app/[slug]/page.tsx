"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Normal from "@/components/templates/normal/Normal";
import Pro from "@/components/templates/pro/Pro";
import { MenuTemplateType } from "@/generated/prisma/enums";
import Ecommerce from "@/components/templates/ecommerce/Ecommerce";
import { fetchMenuBySlug, fetchMenuItems } from "@/lib/api/menus";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  offerPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  isFeatured?: boolean;
}

export default function SlugMenuPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [shopName, setShopName] = useState("");
  const [shopPlace, setShopPlace] = useState("");
  const [shopContact, setShopContact] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<MenuTemplateType | null>(null);

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
        setShopName(String(menu?.shopName ?? ""));
        setShopPlace(String(menu?.place ?? ""));
        setShopContact(String(menu?.contactNumber ?? ""));
        setTemplate((menu?.template as MenuTemplateType) ?? null);
        const arr = items as Array<Record<string, unknown>>;
        const list = arr.map((it) => {
          const getStr = (k: string, fallback = "") => {
            const v = it[k];
            return typeof v === "string" ? v : fallback;
          };
          const getNum = (k: string, fallback = 0) => {
            const v = it[k];
            return typeof v === "number" ? v : fallback;
          };
          const getBool = (k: string, fallback = false) => {
            const v = it[k];
            return typeof v === "boolean" ? v : fallback;
          };
          const id = getStr("id");
          const name = getStr("name", "Item");
          const category = getStr("category");
          const price = getNum("price", 0);
          const offerPrice = getNum("offerPrice", 0) || undefined;
          const image = getStr(
            "image",
            "/default-product.png"
          );
          const isFeatured = getBool("isFeatured", false);
          return {
            id,
            name,
            category,
            description: category,
            price,
            offerPrice,
            image,
            rating: 4.6,
            reviews: 0,
            isFeatured,
          };
        });
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

  if (template === MenuTemplateType.PRO) {
    return <Pro shopName={shopName} shopPlace={shopPlace} shopContact={shopContact} products={products} />;
  }
  if (template === MenuTemplateType.E_COM) {
    return <Ecommerce shopName={shopName} shopPlace={shopPlace} shopContact={shopContact} products={products} />;
  }
  return <Normal shopName={shopName} shopPlace={shopPlace} shopContact={shopContact} products={products} />;
}