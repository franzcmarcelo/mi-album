import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login'],
        disallow: ['/album/'],
      },
    ],
    sitemap: 'https://mi-album-phi.vercel.app/sitemap.xml',
  };
}
