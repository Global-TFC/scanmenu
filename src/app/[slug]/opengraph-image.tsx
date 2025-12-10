
import { ImageResponse } from "next/og";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// --- Types ---
type ShopData = {
  shopName: string;
  shopLogo: string | null;
  shopPlace: string | null;
  template: string;
};

type ProductData = {
  id: string;
  name: string;
  price: number;
  offerPrice: number | null;
  image: string | null;
};

// --- Template Renderers ---

// 1. PRO Template (Neumorphism)
const renderPro = (shop: ShopData, products: ProductData[]) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#e0e0e0",
        fontFamily: "sans-serif",
        padding: "40px",
        alignItems: "center",
      }}
    >
      {/* Header Pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "90%",
          padding: "16px 32px",
          borderRadius: "999px",
          backgroundColor: "#e0e0e0",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
          marginBottom: "60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {shop.shopLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.shopLogo}
              alt=""
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow:
                  "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
              }}
            />
          ) : (
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#3a3a3a",
              }}
            >
              {shop.shopName.charAt(0)}
            </div>
          )}
          <span
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#3a3a3a",
            }}
          >
            {shop.shopName}
          </span>
        </div>
        <div style={{ display: "flex", gap: "24px", color: "#6a6a6a", fontSize: "20px", fontWeight: "500" }}>
           <span>Collection</span>
           <span>About</span>
           <span>Contact</span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "flex", gap: "40px", width: "100%", justifyContent: "center" }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#e0e0e0",
              borderRadius: "24px",
              padding: "24px", // inner padding
              boxShadow: "16px 16px 32px #bebebe, -16px -16px 32px #ffffff",
              width: "320px",
            }}
          >
            {/* Image Box */}
            <div
              style={{
                width: "100%",
                height: "240px",
                borderRadius: "16px",
                overflow: "hidden",
                marginBottom: "24px",
                  display: "flex",
              }}
            >
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#d0d0d0",
                      display: "flex",
                  }}
                />
              )}
            </div>
            
             {/* Text Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  color: "#3a3a3a",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                    display: "flex",
                }}
              >
                {p.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "28px", fontWeight: "bold", color: "#3a3a3a" }}>
                  Rs. {p.offerPrice || p.price}
                </span>
                {p.offerPrice && p.price && p.offerPrice < p.price && (
                   <span style={{ fontSize: "18px", color: "#8a8a8a", textDecoration: "line-through" }}>
                      Rs. {p.price}
                   </span>
                )}
              </div>
            </div>
             
             {/* Add Button Mock */}
             <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                 <div style={{ 
                     display: "flex", 
                     width: "48px", 
                     height: "48px", 
                     borderRadius: "16px",
                     backgroundColor: "#e0e0e0",
                     boxShadow: "6px 6px 12px #bebebe, -6px -6px 12px #ffffff",
                     alignItems: "center",
                     justifyContent: "center",
                     color: "#8b7355"
                 }}>
                     +
                 </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. E_COM Template (Neo-Brutalism)
const renderEcommerce = (shop: ShopData, products: ProductData[]) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          width: "100%",
          padding: "24px",
          backgroundColor: "white",
          borderBottom: "4px solid black",
          boxShadow: "0 4px 0 #000",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
           <div style={{
               width: "60px",
               height: "60px",
               border: "3px solid black",
               backgroundColor: "black",
               transform: "rotate(-2deg)",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               boxShadow: "3px 3px 0 #000",
               overflow: "hidden",
           }}>
               {shop.shopLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                   <img src={shop.shopLogo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
               ) : (
                   <span style={{ color: "white", fontSize: "30px", fontWeight: "900" }}>
                       {shop.shopName.charAt(0)}
                   </span>
               )}
           </div>
           <span style={{ fontSize: "40px", fontWeight: "900", textTransform: "uppercase", transform: "rotate(-1deg)" }}>
               {shop.shopName}
           </span>
        </div>
        
         <div style={{ 
             display: "flex",
             backgroundColor: "#fde047", // yellow-300
             border: "3px solid black",
             padding: "12px 24px",
             boxShadow: "4px 4px 0 #000",
             fontSize: "20px",
             fontWeight: "900",
             textTransform: "uppercase"
         }}>
             Shop Now
         </div>
      </div>

       {/* Grid */}
      <div style={{ display: "flex", gap: "30px", width: "100%", justifyContent: "center", padding: "0 40px" }}>
        {products.map((p, i) => {
            const rot = i % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)";
            return (
                <div
                    key={p.id}
                    style={{
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "white",
                    border: "3px solid black",
                    padding: "16px",
                    boxShadow: "6px 6px 0 #000",
                    width: "300px",
                    transform: rot
                    }}
                >
                    <div style={{ width: "100%", height: "250px", border: "3px solid black", marginBottom: "16px", overflow: "hidden", display: "flex" }}>
                        {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : null}
                         {p.offerPrice && p.price && p.offerPrice < p.price ? (
                              <div style={{
                                  position: "absolute",
                                  top: "8px",
                                  left: "8px",
                                  backgroundColor: "#dc2626",
                                  color: "white",
                                  padding: "4px 8px",
                                  border: "2px solid black",
                                  boxShadow: "2px 2px 0 #000",
                                  fontWeight: "900",
                                  fontSize: "14px",
                                  transform: "rotate(-3deg)",
                                  display: "flex"
                              }}>
                                  SALE
                              </div>
                         ) : null}
                    </div>

                    <div style={{ fontSize: "20px", fontWeight: "900", textTransform: "uppercase", marginBottom: "4px", lineHeight: "1.2" }}>
                        {p.name}
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                            <span style={{ fontSize: "24px", fontWeight: "900" }}>Rs.{p.offerPrice || p.price}</span>
                             {p.offerPrice && p.price && p.offerPrice < p.price && (
                                <span style={{ fontSize: "14px", textDecoration: "line-through", color: "#6b7280", fontWeight: "700" }}>
                                    Rs.{p.price}
                                </span>
                             )}
                        </div>
                         <div style={{ 
                             display: "flex",
                             width: "40px", 
                             height: "40px", 
                             backgroundColor: "black", 
                             color: "white",
                             border: "3px solid black",
                             boxShadow: "3px 3px 0 #000",
                             alignItems: "center",
                             justifyContent: "center",
                             fontSize: "24px",
                             fontWeight: "bold"
                         }}>
                             +
                         </div>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

// 3. Normal/Shared Fallback
const renderNormal = (shop: ShopData, products: ProductData[]) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: "white", fontFamily: "sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", width: "100%", padding: "30px 40px", borderBottom: "1px solid #f3f4f6", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {shop.shopLogo && (
                         // eslint-disable-next-line @next/next/no-img-element
                        <img src={shop.shopLogo} alt="" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                    )}
                    <span style={{ fontSize: "28px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.05em" }}>
                        {shop.shopName}
                    </span>
                </div>
                 <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                     <span style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>ScanMenu</span>
                 </div>
            </div>

            {/* Content */}
             <div style={{ display: "flex", flexDirection: "column", padding: "40px", flex: 1 }}>
                  <div style={{ fontSize: "18px", color: "#6b7280", marginBottom: "20px" }}>Featured Items from {shop.shopName}</div>
                  
                   <div style={{ display: "flex", gap: "20px", width: "100%" }}>
                       {products.map(p => (
                           <div key={p.id} style={{ display: "flex", flexDirection: "column", width: "33%" }}>
                               <div style={{ width: "100%", height: "300px", backgroundColor: "#f3f4f6", borderRadius: "12px", overflow: "hidden", marginBottom: "16px", display: "flex" }}>
                                    {p.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : null}
                               </div>
                               <span style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>{p.name}</span>
                               <span style={{ fontSize: "16px", color: "#4b5563" }}>Rs. {p.offerPrice || p.price}</span>
                           </div>
                       ))}
                   </div>
             </div>
        </div>
    )
}

// 4. Cafe Template (Blue Gradient)
const renderCafe = (shop: ShopData, products: ProductData[]) => {
     return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "linear-gradient(to bottom right, #eff6ff, #dbeafe)", fontFamily: "sans-serif" }}>
             {/* Navbar like */}
            <div style={{ display: "flex", width: "100%", padding: "40px", alignItems: "center" }}>
                 <div style={{ fontSize: "40px", fontWeight: "900", background: "linear-gradient(to right, #2563eb, #9333ea)", backgroundClip: "text", color: "transparent" }}>
                     {shop.shopName}
                 </div>
            </div>
            
            {/* Hero Card Area */}
             <div style={{ display: "flex", flex: 1, padding: "0 40px 40px 40px", gap: "30px", alignItems: "center", justifyContent: "center" }}>
                 {products.map(p => (
                     <div key={p.id} style={{ 
                         display: "flex", 
                         flexDirection: "column", 
                         width: "300px", 
                         backgroundColor: "rgba(255,255,255,0.6)", 
                         borderRadius: "24px", 
                         border: "1px solid rgba(255,255,255,0.4)",
                         padding: "20px",
                         boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                     }}>
                         <div style={{ width: "100%", height: "200px", borderRadius: "16px", overflow: "hidden", marginBottom: "16px", display: "flex" }}>
                              {p.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                  <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : null}
                         </div>
                         <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "8px" }}>{p.name}</div>
                         <div style={{ fontSize: "24px", fontWeight: "800", color: "#2563eb" }}>Rs. {p.offerPrice || p.price}</div>
                     </div>
                 ))}
             </div>
        </div>
     )
}


export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  // 1. Fetch data
  const menu = await prisma.menu.findUnique({
    where: { slug },
    include: {
      items: {
        where: {
          isFeatured: true,
          isAvailable: true,
        },
        take: 3,
      },
    },
  });

  if (!menu) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "linear-gradient(to bottom right, #4F46E5, #9333EA)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontFamily: "sans-serif",
          }}
        >
          {slug} Shop Not Found
        </div>
      ),
      { ...size }
    );
  }

  let productsItem = menu.items;
  if (productsItem.length === 0) {
     const allItems = await prisma.menuItem.findMany({
        where: { menuId: menu.id, isAvailable: true },
        take: 3,
     });
     productsItem = allItems;
  }
  
  // Transform to simpler types for renderers
  const shopData: ShopData = {
      shopName: menu.shopName,
      shopLogo: menu.shopLogo,
      shopPlace: menu.place,
      template: menu.template
  };
  
  const productData: ProductData[] = productsItem.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price || 0,
      offerPrice: p.offerPrice,
      image: p.image
  }));

  // Switch Template
  let content;
  switch (menu.template) {
      case "E_COM":
          content = renderEcommerce(shopData, productData);
          break;
      case "PRO":
          content = renderPro(shopData, productData);
          break;
      case "CAFE":
          content = renderCafe(shopData, productData);
          break;
      case "NORMAL":
      default:
          content = renderNormal(shopData, productData);
          break;
  }

  return new ImageResponse(content, { ...size });
}
