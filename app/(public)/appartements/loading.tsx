import { PropertyCardSkeleton } from '@/components/ui/skeleton';

export default function LoadingAppartements() {
  return (
    <div className="container-app py-10 sm:py-14">
      <div className="mb-8 space-y-3">
        <div className="h-9 w-2/3 max-w-md animate-pulse rounded-xl bg-ink-100 sm:w-1/3" />
        <div className="h-5 w-1/2 max-w-sm animate-pulse rounded-lg bg-ink-100" />
      </div>
      <div className="mb-6 h-10 w-full animate-pulse rounded-xl bg-ink-100 sm:w-64" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
