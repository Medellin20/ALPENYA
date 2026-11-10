import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
import { getSiteUrl } from '@/lib/utils/site-url';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: { icon: '/favicon.svg' },
  title: {
    default: 'LOCAVIA — Biens à louer en France',
    template: '%s | LOCAVIA',
  },
  description:
    'Découvrez nos chalets, villas, appartements meublés et mobil-homes à louer en France.',
  keywords: [
    'location chalet France',
    'location villa France',
    'location appartement meublé',
    'location mobil-home',
    'chalet Alpes',
    'villa Côte d’Azur',
    'LOCAVIA',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'LOCAVIA',
    title: 'LOCAVIA — Biens à louer en France',
    description:
      'Recherchez, visitez et réservez votre prochain logement en toute confiance.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LOCAVIA — Biens à louer en France',
    description: 'Trouvez votre prochain logement en France.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font-locavia)',
            },
          }}
        />
      </body>
    </html>
  );
}
