import type { Metadata } from "next";
import "./globals.css";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Uni Course Planner — 2025",
  description: "Interactive colour-coded planner for assessments and deadlines",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}

export const metadata: Metadata = {
  title: "Uni Course Planner — 2025",
  description: "Interactive colour-coded planner for assessments and deadlines",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
