import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proveedores",
};

export default function SuppliersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
