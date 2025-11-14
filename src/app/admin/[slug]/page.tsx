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
} from "@/lib/api/menus";
import { Menu } from "@/generated/prisma/client";
import { MenuTemplateType } from "@/generated/prisma/enums";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("products");

  // Menu data state
  const [menuData, setMenuData] = useState<Menu | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);

  // Shop details state
  const [userId, setUserId] = useState("");
  const [shopName, setShopName] = useState("");
  const [place, setPlace] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [template, setTemplate] = useState("PRO");

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
        setMenuData(menu);

        // Populate shop details from fetched menu
        setUserId(menu.userId);
        setShopName(menu.title);
        setPlace(menu.summary || "");
        setTemplate(menu.template || "PRO");
        // setContactNumber can be added if it exists in your Menu model
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
          const itemsArr = items as unknown as Array<Record<string, unknown>>;
          const mapped = itemsArr.map((it) => ({
            id: (it.id as string) ?? Date.now().toString(),
            name: String(it.name ?? "Menu Item"),
            category: String(it.description ?? "Menu Item"),
            price: it.price ? Number(it.price) : 0,
            image: String(it.image ?? ""),
          }));
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

    try {
      const updated = await updateMenu({
        id: menuData.id,
        title: shopName,
        summary: place,
        template: template as MenuTemplateType,
      });
      
      setMenuData(updated);
      alert("Shop details saved successfully!");
      setMobileSidebarOpen(false);
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
        description: productData.category,
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
        description: product.category,
        price: product.price,
        image: product.image,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                name: String(updated.name ?? product.name),
                category: String(updated.description ?? product.category),
                price: Number(updated.price ?? product.price),
                image: String(updated.image ?? product.image),
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
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Display menu data info */}
          {menuData && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-900">Menu Info:</h3>
              <p className="text-sm text-blue-700">
                {menuData.title} • Slug: {menuData.slug} • Template:{" "}
                {menuData.template}
              </p>
            </div>
          )}

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
            />
          )}

          {activeMenu === "shop" && (
            <ShopDetailsView
              userId={userId}
              shopName={shopName}
              place={place}
              contactNumber={contactNumber}
              template={template}
              onUserIdChange={setUserId}
              onShopNameChange={setShopName}
              onPlaceChange={setPlace}
              onContactNumberChange={setContactNumber}
              onTemplateChange={setTemplate}
              onSave={handleSaveShopDetails}
            />
          )}

          {activeMenu === "tools" && (
            <MenuToolsView
              shopName={shopName || menuData?.title || "Your Shop"}
              menuUrl={
                typeof window !== "undefined"
                  ? `${window.location.origin}/menu/${
                      menuData?.slug || "shop-123"
                    }`
                  : `/menu/${menuData?.slug || "shop-123"}`
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}
