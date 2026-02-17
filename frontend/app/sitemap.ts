import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/seo/seo.config';

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = [
        '',
        '/about',
        '/attractions',
        '/book',
        '/contact',
        '/facilities',
        '/faq',
        '/groups',
        '/guidelines',
        '/parties',
        '/pricing',
        '/privacy',
        '/safety',
        '/terms',
        '/tickets',
        '/waiver',
        '/waiver-terms',
    ].map((route) => ({
        url: `${SEO_CONFIG.baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
