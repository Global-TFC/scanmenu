"use server";

import prisma from "@/lib/prisma";

export async function getCategories(slug: string) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        menu: {
          slug: slug,
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
