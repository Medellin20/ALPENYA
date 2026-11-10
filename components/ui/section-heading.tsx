import { cn } from '@/lib/utils/cn';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      {eyebrow && (
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-canal-600">{eyebrow}</span>
      )}
      <h2 className="mt-4 font-serif text-3xl font-normal leading-tight tracking-tight text-ink-900 sm:text-5xl">{title}</h2>
      {description && (
        <p className={cn('mt-5 max-w-2xl text-sm leading-7 text-ink-600', align === 'center' && 'mx-auto')}>
          {description}
        </p>
      )}
    </div>
  );
}
