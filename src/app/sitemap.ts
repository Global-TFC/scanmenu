import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scanmenu-five.vercel.app/'

  // Fetch all shops
  const menus = await prisma.menu.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const shops = menus.map((menu) => ({
    url: `${baseUrl}/${menu.slug}`,
    lastModified: menu.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...shops,
  ]
}
