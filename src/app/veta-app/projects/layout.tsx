import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Veta",
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
