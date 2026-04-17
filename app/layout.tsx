import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BPIS Network",
  description: "Black Phenomenon Intelligence Suite — operator console",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
