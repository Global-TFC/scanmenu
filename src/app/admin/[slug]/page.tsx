"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Package, Store, Wrench } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import DashboardView from "@/components/DashboardView";
import ProductsView from "@/components/ProductsView";
import ShopDetailsView from "@/components/ShopDetailsView";
import MenuToolsView from "@/components/MenuToolsView";
import { Product, MenuItem } from "../types";
import { useParams, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import {
  fetchMenuBySlug,
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenu,
  bulkUpsertMenuItems,
} from "@/lib/api/menus";
import { Menu } from "@/generated/prisma/client";
import { MenuTemplateType } from "@/generated/prisma/enums";

type MenuWithUser = Menu & {
  user: {
    isSubscribed: boolean;
  };
};

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("products");

  // Menu data state
  // Menu data state
  const [menuData, setMenuData] = useState<MenuWithUser | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);

  // Shop details state
  // Shop details state
  const [menuSlug, setMenuSlug] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopLogo, setShopLogo] = useState("");
  const [place, setPlace] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [template, setTemplate] = useState("PRO");
  const [isWhatsappOrderingEnabled, setIsWhatsappOrderingEnabled] = useState(true);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: activeMenu === "dashboard",
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      active: activeMenu === "products",
    },
    {
      id: "shop",
      label: "Shop Details",
      icon: Store,
      active: activeMenu === "shop",
    },
    {
      id: "tools",
      label: "Menu Tools",
      icon: Wrench,
      active: activeMenu === "tools",
    },
  ];

  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { slug } = useParams();

  // Fetch menu data by slug
  useEffect(() => {
    if (!slug) return;

    async function loadMenu() {
      try {
        setIsLoadingMenu(true);
        setMenuError(null);

        const s = slug as string;
        const menu = await fetchMenuBySlug(s);

        if (!menu.user?.isSubscribed) {
          router.push(`/${s}/thank-you`);
          return;
        }

        setMenuData(menu);

        // Populate shop details from fetched menu
        setMenuSlug(menu.slug);
        setShopName(menu.shopName);
        setShopLogo(menu.shopLogo || "");
        setPlace(menu.place || "");
        setContactNumber(menu.contactNumber || "+91 ");
        setTemplate(menu.template || "PRO");
        setIsWhatsappOrderingEnabled(menu.isWhatsappOrderingEnabled ?? true);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch menu";
        setMenuError(errorMessage);
        console.error("Error fetching menu:", error);
      } finally {
        setIsLoadingMenu(false);
      }
    }

    loadMenu();
  }, [slug]);

  // Fetch menu items from API
  useEffect(() => {
    if (!slug) return;

    const loadItems = async () => {
      try {
        const items = await fetchMenuItems(slug as string);
        if (Array.isArray(items) && items.length) {
          const itemsArr = items as Array<Record<string, unknown>>;
          const mapped = itemsArr.map((it) => {
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
              id: getStr("id", Date.now().toString()),
              name: getStr("name", "Menu Item"),
              category: getStr("category", "Menu Item"),
              price: getNum("price", 0),
              image: getStr("image", ""),
              isFeatured: getBool("isFeatured", false),
              offerPrice: (() => {
                const v = it["offerPrice"];
                return typeof v === "number" ? (v as number) : undefined;
              })(),
            };
          });
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to load menu items:", err);
      }
    };

    loadItems();
  }, [slug]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/");
    }
  }, [isPending, session, router]);

  const handleSaveShopDetails = async () => {
    if (!menuData?.id) {
      alert("Menu data not loaded");
      return;
    }

    if (contactNumber && contactNumber !== '+91 ' && !/^\+91 \d{10}$/.test(contactNumber)) {
      alert("WhatsApp Number must be 10 digits");
      return;
    }

    try {
      const updated = await updateMenu({
        id: menuData.id,
        shopName,
        shopLogo,
        place,
        contactNumber,
        template: template as MenuTemplateType,
        slug: menuSlug !== slug ? menuSlug : undefined,
        isWhatsappOrderingEnabled,
      });
      
      setMenuData(updated);
      alert("Shop details saved successfully!");
      
      // If slug changed, redirect to new admin page
      if (menuSlug !== slug) {
        window.location.href = `/admin/${menuSlug}`;
      } else {
        setMobileSidebarOpen(false);
      }
    } catch (error) {
      alert(
        `Failed to save shop details: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleAddProduct = async (productData: Omit<Product, "id">) => {
    try {
      const created = await createMenuItem({
        slug: slug as string,
        name: productData.name,
        image: productData.image,
        price: productData.price,
        category: productData.category,
      });
      const newProduct: Product = {
        id: String(created.id),
        ...productData,
      };
      setProducts([...products, newProduct]);
    } catch (error) {
      alert(
        `Failed to add product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteMenuItem(slug as string, id);
      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      alert(
        `Failed to delete product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleEditProduct = async (product: Product) => {
    try {
      const updated = await updateMenuItem({
        slug: slug as string,
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        isFeatured: product.isFeatured,
        offerPrice: product.offerPrice,
      });
      const updatedItem = updated as Record<string, unknown>;
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                name: typeof updatedItem.name === "string" ? (updatedItem.name as string) : product.name,
                category: typeof updatedItem.category === "string" ? (updatedItem.category as string) : product.category,
                price: typeof updatedItem.price === "number" ? (updatedItem.price as number) : product.price,
                offerPrice: typeof updatedItem.offerPrice === "number" ? (updatedItem.offerPrice as number) : product.offerPrice,
                image: typeof updatedItem.image === "string" ? (updatedItem.image as string) : product.image,
                isFeatured: typeof updatedItem.isFeatured === "boolean" ? (updatedItem.isFeatured as boolean) : product.isFeatured,
              }
            : p
        )
      );
    } catch (error) {
      alert(
        `Failed to edit product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleBulkProducts = async (items: any[]) => {
    try {
      const result = await bulkUpsertMenuItems(slug as string, items);
      alert(result.message);
      // Refresh products
      const updatedItems = await fetchMenuItems(slug as string);
      if (Array.isArray(updatedItems)) {
        const itemsArr = updatedItems as Array<Record<string, unknown>>;
        const mapped = itemsArr.map((it) => {
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
              id: getStr("id", Date.now().toString()),
              name: getStr("name", "Menu Item"),
              category: getStr("category", "Menu Item"),
              price: getNum("price", 0),
              image: getStr("image", ""),
              isFeatured: getBool("isFeatured", false),
              offerPrice: (() => {
                const v = it["offerPrice"];
                return typeof v === "number" ? (v as number) : undefined;
              })(),
            };
          });
        setProducts(mapped);
      }
    } catch (error) {
      alert(
        `Failed to bulk upload products: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Loading states
  if (isPending || isLoadingMenu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect message
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    );
  }

  // Error state for menu fetch
  if (menuError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Menu
          </h2>
          <p className="text-gray-600 mb-4">{menuError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        mobileSidebarOpen={mobileSidebarOpen}
        menuItems={menuItems}
        onMenuClick={(id) => setActiveMenu(id)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        signOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onMobileMenuClick={() => setMobileSidebarOpen(true)}
          onDesktopMenuClick={() => setSidebarOpen(!sidebarOpen)}
          shopName={shopName || menuData?.shopName}
          shopLogo={shopLogo || menuData?.shopLogo || undefined}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Display menu data info */}


          {activeMenu === "dashboard" && (
            <DashboardView
              products={products}
              categories={categories}
              onMenuChange={setActiveMenu}
            />
          )}

          {activeMenu === "products" && (
            <ProductsView
              products={products}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              onEditProduct={handleEditProduct}
              onBulkUpload={handleBulkProducts}
              slug={slug as string}
            />
          )}

          {activeMenu === "shop" && (
            <ShopDetailsView
              slug={menuSlug} // Pass menuSlug
              shopName={shopName}
              shopLogo={shopLogo}
              place={place}
              contactNumber={contactNumber}
              isWhatsappOrderingEnabled={isWhatsappOrderingEnabled}
              onSlugChange={setMenuSlug} // New handler for slug change
              onShopNameChange={setShopName}
              onShopLogoChange={setShopLogo}
              onPlaceChange={setPlace}
              onContactNumberChange={setContactNumber}
              onWhatsappOrderingEnabledChange={setIsWhatsappOrderingEnabled}
              onSave={handleSaveShopDetails}
            />
          )}

          {activeMenu === "tools" && (
            <MenuToolsView
              shopName={shopName || menuData?.shopName || "Your Shop"}
              shopLogo={shopLogo || menuData?.shopLogo || undefined}
              menuUrl={
                typeof window !== "undefined"
                  ? `${window.location.origin}/${
                      menuData?.slug || "showrt"
                    }`
                  : `/${menuData?.slug || "showrt"}`
              }
              template={template}
              onTemplateChange={setTemplate}
              onSave={handleSaveShopDetails}
            />
          )}
        </main>
      </div>
    </div>
  );
}
