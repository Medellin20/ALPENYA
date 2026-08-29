import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/utils/site-url';
import { getAllPublishedSlugs } from '@/lib/data/properties';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/appartements',
    '/comment-ca-marche',
    '/a-propos',
    '/contact',
    '/faq',
    '/mentions-legales',
    '/confidentialite',
    '/conditions-generales',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.6,
  }));

  const properties = await getAllPublishedSlugs();
  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${siteUrl}/appartements/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}
