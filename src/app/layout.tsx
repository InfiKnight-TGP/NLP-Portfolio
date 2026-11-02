import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dinesh Raj N · CSI4001 Natural Language Processing Portfolio",
  description:
    "Course portfolio of Dinesh Raj N for CSI4001 Natural Language Processing at VIT, Fall Semester 2026-27, guided by Dr. Sharmila Banu K.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
