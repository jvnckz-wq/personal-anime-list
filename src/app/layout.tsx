import type { Metadata, Viewport } from "next";
import { Dela_Gothic_One, Zen_Kaku_Gothic_New } from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import "./globals.css";

const display = Dela_Gothic_One({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Zen_Kaku_Gothic_New({ weight: ["500", "700"], subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "PAL", template: "%s · PAL" },
  description: "A personal anime watchlist that plays like a game menu: continue a show, log episodes, clear files.",
};

export const viewport: Viewport = { themeColor: "#0F0F12" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
