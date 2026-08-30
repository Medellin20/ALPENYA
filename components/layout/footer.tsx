import Link from 'next/link';
import { Facebook, Home, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

const COLUMN_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/appartements', label: 'Chalets & villas' },
  { href: '/comment-ca-marche', label: 'Comment ça marche' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
];

const LEGAL_LINKS = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/confidentialite', label: 'Confidentialité' },
  { href: '/conditions-generales', label: 'Conditions générales' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-100 bg-ink-950 text-sand-200">
      <div className="container-app grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Home className="h-4.5 w-4.5 text-white" strokeWidth={2.25} />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              ALPENIA
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-sand-300">
            Votre sélection de chalets et villas d’exception en France — de la découverte
            du bien jusqu’à la remise des clés.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-sand-200 transition-colors hover:bg-white/15 hover:text-white"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-sand-200 transition-colors hover:bg-white/15 hover:text-white"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-sand-200 transition-colors hover:bg-white/15 hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-eyebrow uppercase text-sand-400">Navigation</h3>
          <ul className="mt-4 space-y-2.5">
            {COLUMN_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-sand-300 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-eyebrow uppercase text-sand-400">Informations légales</h3>
          <ul className="mt-4 space-y-2.5">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-sand-300 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-eyebrow uppercase text-sand-400">Contact</h3>
          <ul className="mt-4 space-y-3">
            <li>
              <a
                href="mailto:contacts@alpenia-residences.com"
                className="flex min-w-0 items-center gap-2.5 break-all text-sm text-sand-300 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0" />
                contacts@alpenia-residences.com
              </a>
            </li>
            <li>
              <a
                href="tel:+31201234567"
                className="flex items-center gap-2.5 text-sm text-sand-300 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0" />
                +33 1 23 45 67 89
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-app flex flex-col items-center justify-between gap-3 py-5 text-xs text-sand-400 sm:flex-row">
          <p>© {year} ALPENIA. Tous droits réservés.</p>
          <p>Location de chalets et villas en France</p>
        </div>
      </div>
    </footer>
  );
}
