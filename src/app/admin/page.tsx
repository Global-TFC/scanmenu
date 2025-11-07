"use client";

import { useState } from "react";
import { LayoutDashboard, Package, Store } from "lucide-react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import DashboardView from "./components/DashboardView";
import ProductsView from "./components/ProductsView";
import ShopDetailsView from "./components/ShopDetailsView";
import { Product, MenuItem } from "./types";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("products");
  
  // Shop details state
  const [userId, setUserId] = useState("");
  const [shopName, setShopName] = useState("");
  const [place, setPlace] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  // Products state
  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "Burger", category: "Fast Food", price: 8.99, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop" },
    { id: "2", name: "Pizza", category: "Italian", price: 12.99, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop" },
    { id: "3", name: "Pasta Carbonara", category: "Italian", price: 14.50, image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=200&h=200&fit=crop" },
    { id: "4", name: "Caesar Salad", category: "Salads", price: 9.99, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200&h=200&fit=crop" },
  ]);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: activeMenu === "dashboard" },
    { id: "products", label: "Products", icon: Package, active: activeMenu === "products" },
    { id: "shop", label: "Shop Details", icon: Store, active: activeMenu === "shop" },
  ];

  const handleSaveShopDetails = () => {
    console.log("Shop details saved:", { userId, shopName, place, contactNumber });
    alert("Shop details saved successfully!");
    setMobileSidebarOpen(false);
  };

  const handleAddProduct = (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productData,
    };
    setProducts([...products, newProduct]);
    alert("Product added successfully!");
  };

  const handleDeleteProduct = (id: string) => {
      setProducts(products.filter(product => product.id !== id));
  };

  const handleEditProduct = (product: Product) => {
    // Edit functionality can be implemented here
    console.log("Edit product:", product);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        mobileSidebarOpen={mobileSidebarOpen}
        menuItems={menuItems}
        activeMenu={activeMenu}
        onMenuClick={setActiveMenu}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onMobileMenuClick={() => setMobileSidebarOpen(true)}
          onDesktopMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

      {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
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
              onUserIdChange={setUserId}
              onShopNameChange={setShopName}
              onPlaceChange={setPlace}
              onContactNumberChange={setContactNumber}
              onSave={handleSaveShopDetails}
            />
          )}
      </main>
          </div>
    </div>
  );
}
