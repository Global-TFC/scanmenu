import { MenuTemplateType } from "@/generated/prisma/enums";

export async function createMenu(data: {
  userId: string;
  slug: string;
  shopName: string;
  shopLogo?: string;
  place?: string;
  contactNumber?: string;
  template?: MenuTemplateType;
  isWhatsappOrderingEnabled?: boolean;
}) {
  const res = await fetch("/api/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    // Try to parse JSON error body, otherwise return status + text
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create menu");
    }
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function isMenuFormAlreadyFilled(userId: string) {
  // If no userId is provided, treat it as "no menu" rather than throwing.
  // This makes client calls simpler (they can pass an empty string safely).
  if (!userId) return { exists: false };

  const res = await fetch(
    `/api/menu/check?userId=${encodeURIComponent(userId)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    if (res.status === 404) {
      return { exists: false };
    }
    // Try to extract server-provided error message when available
    try {
      const body = await res.json();
      throw new Error(body.error || "Failed to check menu form status");
    } catch {
      throw new Error(
        `Failed to check menu form status: ${res.status} ${res.statusText}`
      );
    }
  }

  return res.json();
}

export async function fetchMenuBySlug(slug: string) {
  if (!slug) throw new Error("Missing slug");

  const url = `/api/menu/${encodeURIComponent(slug)}`;
  const res = await fetch(url);
  if (!res.ok) {
    // try to parse JSON error body for better messages
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await res.json();
      throw new Error(
        body.error || `Failed to fetch menu (status ${res.status})`
      );
    }
    throw new Error(`Failed to fetch menu: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchMenuItems(slug: string) {
  if (!slug) throw new Error("Missing slug");
  const url = `/api/menu/${encodeURIComponent(slug)}/items`;
  const res = await fetch(url);
  const text = await res.text();
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    const raw =
      parsed?.error ??
      parsed?.details ??
      text ??
      `${res.status} ${res.statusText}`;
    const msg = typeof raw === "string" ? raw : JSON.stringify(raw);
    console.error("fetchMenuItems error", {
      url,
      status: res.status,
      body: parsed ?? text,
    });
    return [];
  }

  return parsed && parsed.items ? (parsed.items as unknown[]) : [];
}

export async function createMenuItem(data: {
  slug: string;
  name: string;
  image?: string;
  category?: string;
  price?: number;
  offerPrice?: number;
  isFeatured?: boolean;
  isAvailable?: boolean;
}) {
  const res = await fetch(`/api/menu/${encodeURIComponent(data.slug)}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    // Try to parse JSON error body, otherwise return status + text
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create menu item");
    }
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function extractMenuFromImage(image: string) {
  if (!image) throw new Error("Missing image data");

  const res = await fetch("/api/extract-menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image }),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const error = await res.json();
      throw new Error(error.error || "Failed to extract menu");
    }
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }

  return res.json();
}

export async function updateMenu(data: {
  id: string;
  shopName?: string;
  shopLogo?: string;
  place?: string;
  contactNumber?: string;
  locationUrl?: string;
  template?: MenuTemplateType;
  slug?: string;
  isWhatsappOrderingEnabled?: boolean;
  themeConfig?: any;
}) {
  if (!data.id) throw new Error("Menu id is required");

  const res = await fetch("/api/menu", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update menu");
    }
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }

  return res.json();
}

export async function updateMenuItem(data: {
  slug: string;
  id: string;
  name?: string;
  image?: string;
  category?: string;
  price?: number;
  offerPrice?: number;
  isFeatured?: boolean;
  isAvailable?: boolean;
}) {
  const res = await fetch(`/api/menu/${encodeURIComponent(data.slug)}/items`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update menu item");
    }
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function deleteMenuItem(slug: string, id: string) {
  const res = await fetch(`/api/menu/${encodeURIComponent(slug)}/items`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, id }),
  });
  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const error = await res.json();
      throw new Error(error.error || "Failed to delete menu item");
    }
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function bulkUpsertMenuItems(slug: string, items: any[]) {
  const res = await fetch(`/api/menu/${encodeURIComponent(slug)}/items/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const error = await res.json();
      throw new Error(error.error || "Failed to bulk upsert menu items");
    }
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }

  return res.json();
}
