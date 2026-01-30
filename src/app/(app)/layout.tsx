import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import AppLayoutClient from "@/components/layouts/app-layout";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayoutClient>{children}</AppLayoutClient>
    </AuthProvider>
  );
}
