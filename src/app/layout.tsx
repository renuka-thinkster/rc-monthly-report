import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rolling Crunchys — Monthly Report",
  description: "Live monthly report (Sales, Inventory, Purchase, Food Cost, Targets, Daily, Products, Yearly Summary)"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
