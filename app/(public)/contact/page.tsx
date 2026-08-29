import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { ContactForm } from '@/components/forms/contact-form';
import { FadeIn } from '@/components/ui/fade-in';

export const metadata: Metadata = {
  title: 'Contact',
  description: "Contactez l’équipe ALPENYA pour toute question sur la location d’un chalet ou d’une villa en France.",
};

const INFO = [
  { icon: Mail, label: 'contacts@alpenya.fr' },
  { icon: Phone, label: '+33 1 23 45 67 89' },
  { icon: MapPin, label: 'Paris, France' },
  { icon: Clock, label: 'Lun–Ven, 9h–18h (CET)' },
];

export default function ContactPage() {
  return (
    <div className="container-app py-14 sm:py-20">
      <FadeIn>
        <span className="text-eyebrow uppercase text-canal-600">Nous contacter</span>
        <h1 className="mt-2 text-display-sm font-extrabold text-ink-900 sm:text-display-md">
          Une question ? Écrivez-nous
        </h1>
        <p className="mt-3 max-w-xl text-ink-500">
          Notre équipe vous répond généralement sous 48 heures ouvrées.
        </p>
      </FadeIn>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <FadeIn delay={0.05} className="lg:col-span-3">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
            <ContactForm />
          </div>
        </FadeIn>

        <FadeIn delay={0.1} className="lg:col-span-2">
          <div className="rounded-2xl bg-ink-950 p-6 text-white sm:p-8">
            <h2 className="text-lg font-bold">Coordonnées</h2>
            <ul className="mt-5 space-y-4">
              {INFO.map((item) => (
                <li key={item.label} className="flex items-center gap-3 text-sm text-sand-200">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <item.icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
