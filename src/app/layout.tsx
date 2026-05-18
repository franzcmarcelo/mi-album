import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'Mi Álbum - Mundial 2026',
  description: 'Gestiona tu coleccion de figuras digitalmente',
  icons: {
    icon: '/images/world-cup-logo-2.png',
    shortcut: '/images/world-cup-logo-2.png',
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
