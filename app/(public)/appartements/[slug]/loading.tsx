export default function LoadingPropertyDetail() {
  return (
    <div className="container-app py-8 sm:py-12">
      <div className="mb-5 h-4 w-64 animate-pulse rounded bg-ink-100" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-[16/10] w-full animate-pulse rounded-2xl bg-ink-100" />
          <div className="mt-6 space-y-3">
            <div className="h-8 w-2/3 animate-pulse rounded-lg bg-ink-100" />
            <div className="h-4 w-1/3 animate-pulse rounded-lg bg-ink-100" />
          </div>
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-ink-100 lg:col-span-1" />
      </div>
    </div>
  );
}
