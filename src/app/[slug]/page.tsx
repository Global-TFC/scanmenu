import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMenuBySlug } from "@/lib/server/menus";
import SlugMenuClient from "./SlugMenuClient";
import { MenuTemplateType } from "@/generated/prisma/enums";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Helper to transform items to products
function transformItemsToProducts(items: any[]) {
  return items.map((it) => {
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

    return {
      id: getStr("id"),
      name: getStr("name", "Item"),
      category: getStr("category"),
      description: getStr("category"), // Description defaults to category as per original logic
      price: getNum("price", 0),
      offerPrice: getNum("offerPrice", 0) || undefined,
      image: getStr("image", "/default-product.png"),
      rating: 4.6,
      reviews: 0,
      isFeatured: getBool("isFeatured", false),
    };
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const menu = await getMenuBySlug(slug);

  if (!menu) {
    return {
      title: "Shop Not Found",
    };
  }

  const title = `${menu.shopName} | Online Menu`;
  const description = `Check out the menu for ${menu.shopName}. Order online via WhatsApp.`;
  const images = menu.shopLogo ? [menu.shopLogo] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export default async function SlugMenuPage({ params }: PageProps) {
  const { slug } = await params;
  const menu = await getMenuBySlug(slug);

  if (!menu) {
    notFound();
  }

  const products = transformItemsToProducts(menu.items);

  return (
    <SlugMenuClient
      shopName={menu.shopName}
      shopPlace={menu.place || ""}
      shopContact={menu.contactNumber || ""}
      shopLogo={menu.shopLogo || ""}
      products={products}
      template={menu.template as MenuTemplateType}
      isWhatsappOrderingEnabled={menu.isWhatsappOrderingEnabled}
      isReadymade={menu.isReadymade}
    />
  );
}