import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Uni Course Planner — 2025",
  description: "Interactive colour-coded planner for assessments and deadlines",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
