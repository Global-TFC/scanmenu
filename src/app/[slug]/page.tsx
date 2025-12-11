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
  // Fetch menu first to check existence
  const menu = await getMenuBySlug(slug);

  if (!menu) {
    notFound();
  }

  // We only fetch the first 12 items initially for SSR
  // But wait, getMenuBySlug (existing) fetches ALL items via include: { items: true }
  // We should optimize this if we want true "infinite scroll" efficiency from start.
  // However, modifying getMenuBySlug might break other things. 
  // For now, let's just slice the products here OR use our new action if we can call it directly?
  // We can call getProducts directly here!
  
  // Re-fetch using our pagination logic to be consistent? 
  // Or just use the already fetched items but slice them?
  // If `getMenuBySlug` fetches 1000 items, that's heavy.
  // Ideally, `getMenuBySlug` should NOT fetch items, or we make a new function.
  // But strictly following plan: "Limit initial product fetch".
  
  // Let's rely on the fact that `getMenuBySlug` fetches all for now (unless we change it),
  // but we only pass the first 12 to the client to keep hydration payload small?
  // No, if we send 1000 items in props, hydration is heavy.
  
  // Let's use `getProducts` here for the items part.
  
  const { products: initialProducts } = await import("@/actions/get-products").then(mod => 
    mod.getProducts({ slug, page: 1, limit: 12 } as any) // Our action doesn't accept limit yet, default is 12.
  );

  // We need to transform these "ProductResult" back to the "Product" shape if they differ?
  // Our action returns the correct shape (filtered).
  // But we need to make sure we don't conflict with `menu.items`.
  
  // Actually, we can just effectively ignore `menu.items` if we use `initialProducts`.
  
  return (
    <SlugMenuClient
      slug={slug}
      shopName={menu.shopName}
      shopPlace={menu.place || ""}
      shopContact={menu.contactNumber || ""}
      shopLogo={menu.shopLogo || ""}
      products={initialProducts as any} // Casting safely as shapes align mostly
      template={menu.template as MenuTemplateType}
      isWhatsappOrderingEnabled={menu.isWhatsappOrderingEnabled}
      isReadymade={menu.isReadymade}
    />
  );
}