import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shark Advisor",
  description: "Find your path at Miami Dade College",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Panel is ~400px wide: center a mobile-width column when opened standalone */}
        <main className="mx-auto flex h-full min-h-0 max-w-[420px] flex-col bg-white shadow-sm">{children}</main>
      </body>
    </html>
  );
}
