import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') params.set(key, value);
    });
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ''}`;
  }

  const pages = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
    .filter(page => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        aria-label="Page précédente"
        tabIndex={currentPage === 1 ? -1 : undefined}
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink-200 text-ink-600 transition-colors hover:bg-sand-100',
          currentPage === 1 && 'pointer-events-none opacity-40'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      <span className="px-3 text-sm text-ink-700 sm:hidden">Page {currentPage} sur {totalPages}</span>
      {pages.map((page, index) => (
        <span key={page} className="hidden items-center gap-1.5 sm:inline-flex">
          {index > 0 && page - pages[index - 1] > 1 && <span className="px-1 text-ink-400">…</span>}
        <Link
          href={buildHref(page)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
          className={cn(
            'flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl px-2 text-sm font-semibold transition-colors',
            page === currentPage
              ? 'bg-ink-700 text-white'
              : 'border border-ink-200 text-ink-600 hover:bg-sand-100'
          )}
        >
          {page}
        </Link>
        </span>
      ))}

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        aria-label="Page suivante"
        tabIndex={currentPage === totalPages ? -1 : undefined}
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink-200 text-ink-600 transition-colors hover:bg-sand-100',
          currentPage === totalPages && 'pointer-events-none opacity-40'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
