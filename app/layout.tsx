import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tenancy Builder",
  description: "Generate a complete tenancy agreement in minutes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-navy-950 text-white">{children}</body>
    </html>
  );
}
