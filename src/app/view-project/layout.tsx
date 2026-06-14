import type { Metadata } from "next";
import "@/styles/app-overlays.css";
import { montserratBrand } from "@/lib/fonts/montserrat-brand";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ViewProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={montserratBrand.variable}>{children}</div>;
}
