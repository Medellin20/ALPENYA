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
    default: 'ALPENIA — Biens à louer en France',
    template: '%s | ALPENIA',
  },
  description:
    'Découvrez nos chalets, villas, studios meublés et mobil-homes à louer en France.',
  keywords: [
    'location chalet France',
    'location villa France',
    'location studio meublé',
    'location mobil-home',
    'chalet Alpes',
    'villa Côte d’Azur',
    'ALPENIA',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'ALPENIA',
    title: 'ALPENIA — Biens à louer en France',
    description:
      'Recherchez, visitez et réservez votre prochain logement en toute confiance.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ALPENIA — Biens à louer en France',
    description: 'Trouvez votre prochain logement en France.',
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
