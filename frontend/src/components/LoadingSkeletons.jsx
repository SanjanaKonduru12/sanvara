function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/80">
      <SkeletonBlock className="h-72 w-full rounded-3xl" />
      <div className="mt-5 space-y-3">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-6 w-3/4" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <SkeletonBlock className="h-6 w-24" />
          <SkeletonBlock className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900/80 sm:p-10">
      <SkeletonBlock className="h-4 w-32" />
      <SkeletonBlock className="mt-5 h-12 w-full max-w-2xl" />
      <SkeletonBlock className="mt-4 h-5 w-full max-w-xl" />
      <SkeletonBlock className="mt-3 h-5 w-3/4 max-w-lg" />
    </div>
  );
}
