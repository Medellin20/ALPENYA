import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { getSiteUrl } from '@/lib/utils/site-url';

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ALPENIA — Chalets et villas d’exception',
    template: '%s | ALPENIA',
  },
  description:
    'Découvrez, visitez et réservez des chalets et villas soigneusement sélectionnés en France avec ALPENIA.',
  keywords: [
    'location chalet France',
    'location villa France',
    'chalet Alpes',
    'villa Côte d’Azur',
    'ALPENIA',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'ALPENIA',
    title: 'ALPENIA — Chalets et villas d’exception',
    description:
      'Recherchez, visitez et réservez votre prochain chalet ou votre prochaine villa en toute confiance.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ALPENIA — Chalets et villas d’exception',
    description: 'Trouvez votre prochain chalet ou votre prochaine villa en France.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={openSans.variable}>
      <body className="font-sans">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font-open-sans)',
            },
          }}
        />
      </body>
    </html>
  );
}
