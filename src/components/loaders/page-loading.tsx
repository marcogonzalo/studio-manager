import { Skeleton } from "@/components/ui/skeleton";

export type PageLoadingVariant =
  | "default"
  | "dashboard"
  | "table"
  | "cards"
  | "form"
  | "detail";

interface PageLoadingProps {
  /** Layout variant to match the target page. */
  variant?: PageLoadingVariant;
}

const wrapperClass =
  "animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-6 duration-500";

function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-9 w-16 sm:w-32" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

function DefaultVariant() {
  return (
    <>
      <HeaderSkeleton />
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
        <div className="border-border/50 bg-card rounded-xl border p-4 shadow-sm">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="border-border/40 flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function DashboardVariant() {
  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Skeleton className="mt-1 h-8 w-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-border/50 bg-card rounded-xl border p-4 shadow-sm"
          >
            <div className="flex items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="mb-2 h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="border-border/50 bg-card rounded-xl border p-4 shadow-md md:col-span-4">
          <Skeleton className="mb-2 h-6 w-40" />
          <Skeleton className="mb-4 h-4 w-52" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-border/50 flex items-center justify-between rounded-xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
        <div className="border-border/50 bg-card rounded-xl border p-4 shadow-md md:col-span-3">
          <Skeleton className="mb-2 h-6 w-32" />
          <Skeleton className="mb-4 h-4 w-28" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="border-border/50 flex items-center justify-between rounded-xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function TableVariant() {
  return (
    <>
      <HeaderSkeleton />
      <div className="relative max-w-sm">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="bg-card rounded-md border">
        <div className="border-border border-b p-4">
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="divide-border divide-y">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <div className="ml-auto">
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CardsVariant() {
  return (
    <>
      <HeaderSkeleton />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="border-border/50 bg-card rounded-xl border p-4 shadow-sm"
          >
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="mb-4 h-4 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="mt-4 h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </>
  );
}

function FormVariant() {
  return (
    <>
      <HeaderSkeleton />
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="border-border/50 bg-card rounded-xl border p-6 shadow-sm">
          <Skeleton className="mb-2 h-6 w-32" />
          <Skeleton className="mb-6 h-4 w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </>
  );
}

function DetailVariant() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="border-border flex gap-2 border-b">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-t-md" />
        ))}
      </div>
      <div className="border-border/50 bg-card rounded-xl border p-6 shadow-sm">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Loading placeholder for app main views.
 * Variant matches the target page layout for a consistent loading experience.
 */
export function PageLoading({ variant = "default" }: PageLoadingProps) {
  const contentMap = {
    default: DefaultVariant,
    dashboard: DashboardVariant,
    table: TableVariant,
    cards: CardsVariant,
    form: FormVariant,
    detail: DetailVariant,
  };
  const content = contentMap[variant] ?? DefaultVariant;

  return (
    <div className={wrapperClass} aria-label="Cargando">
      {content()}
    </div>
  );
}
