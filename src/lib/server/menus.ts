import prisma from "@/lib/prisma";
import { MenuTemplateType } from "@/generated/prisma/enums";

export async function getMenuBySlug(slug: string) {
  if (!slug) return null;

  try {
    const menu = await prisma.menu.findUnique({
      where: { slug },
      include: {
        items: true,
      },
    });

    if (!menu) return null;

    return menu;
  } catch (error) {
    console.error("Error fetching menu by slug:", error);
    return null;
  }
}
