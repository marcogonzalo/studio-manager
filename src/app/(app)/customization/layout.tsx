import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personalización",
};

export default function CustomizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
