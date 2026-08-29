import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export function StatCard({
  icon: Icon,
  label,
  value,
  href,
  tone = 'default',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  href: string;
  tone?: 'default' | 'positive' | 'warning' | 'info';
}) {
  const toneClasses: Record<string, string> = {
    default: 'bg-ink-50 text-ink-700',
    positive: 'bg-canal-50 text-canal-700',
    warning: 'bg-amber-50 text-amber-700',
    info: 'bg-brick-50 text-brick-600',
  };

  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-canal-500 focus-visible:ring-offset-2"
      aria-label={`${label} : ${value}. Ouvrir la liste correspondante`}
    >
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', toneClasses[tone])}>
        <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
      </div>
      <p className="mt-4 text-2xl font-extrabold text-ink-900">{value}</p>
      <p className="mt-0.5 text-sm text-ink-400">{label}</p>
    </Link>
  );
}
