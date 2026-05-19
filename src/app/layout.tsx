import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

const BASE_URL = 'https://mi-album-phi.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Mi Álbum — Álbum Digital del Mundial 2026',
    template: '%s | Mi Álbum',
  },
  description:
    'Gestiona tu colección de figuras Panini y 3 Reyes del Mundial 2026. Controla lo que tienes, lo que te falta y tus repetidas. Comparte tu progreso con amigos.',
  keywords: [
    'álbum figuritas',
    'Panini 2026',
    'Mundial 2026',
    'figuritas Copa del Mundo',
    'stickers FIFA World Cup',
    '3 Reyes figuritas',
  ],
  authors: [{ name: 'Mi Álbum' }],
  openGraph: {
    title: 'Mi Álbum — Álbum Digital del Mundial 2026',
    description:
      'Gestiona tu colección de figuras Panini y 3 Reyes del Mundial 2026. Comparte tu progreso con amigos.',
    url: `${BASE_URL}/login`,
    siteName: 'Mi Álbum',
    type: 'website',
    locale: 'es',
    images: [
      {
        url: '/images/world-cup-logo-2.png',
        width: 512,
        height: 512,
        alt: 'Mi Álbum — Copa del Mundo 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mi Álbum — Álbum Digital del Mundial 2026',
    description: 'Gestiona tu colección de figuras del Mundial 2026.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE_URL}/login` },
  icons: {
    icon: '/images/favicon.png',
    shortcut: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full">
        {/* Fixed watermark layer — logo 1 top-left, logo 2 bottom-right */}
        <div className="page-background" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
