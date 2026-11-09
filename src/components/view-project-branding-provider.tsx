"use client";

import { createContext, useContext } from "react";
import type { ViewProjectBranding } from "@/lib/view-project-branding";

const ViewProjectBrandingContext = createContext<ViewProjectBranding>({
  accountBranding: false,
});

export function ViewProjectBrandingProvider({
  value,
  children,
}: {
  value: ViewProjectBranding;
  children: React.ReactNode;
}) {
  return (
    <ViewProjectBrandingContext.Provider value={value}>
      {children}
    </ViewProjectBrandingContext.Provider>
  );
}

export function useViewProjectBranding(): ViewProjectBranding {
  return useContext(ViewProjectBrandingContext);
}
