import type { ReactNode } from "react";

/**
 * Full-width sticky top bar for non-transactional system / product / company notices.
 * When rendered in the app shell, sidebar layout must use APP_ANNOUNCEMENT_SIDEBAR_OFFSET.
 */
export const APP_ANNOUNCEMENT_SIDEBAR_OFFSET =
  "md:top-[2.375rem] md:bottom-0 md:h-auto" as const;

export function AppAnnouncementBanner({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="border-border bg-primary/10 text-foreground sticky top-0 z-[60] w-full border-b px-4 py-2 text-center text-sm backdrop-blur-sm print:hidden"
    >
      {children}
    </div>
  );
}
