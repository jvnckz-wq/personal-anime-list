import type { Metadata, Viewport } from "next";
import { Abril_Fatface, Anton, Archivo_Black, Bowlby_One_SC, Dela_Gothic_One, Zen_Kaku_Gothic_New } from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import "./globals.css";

/* UI voice: condensed caps for chrome, a heavy wide face for titles, a clean gothic for reading. */
const ui = Anton({ weight: "400", subsets: ["latin"], variable: "--font-ui" });
const display = Dela_Gothic_One({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Zen_Kaku_Gothic_New({ weight: ["500", "700", "900"], subsets: ["latin"], variable: "--font-body" });
/* Ransom-note lettering cuts each letter from a different face. */
const serif = Abril_Fatface({ weight: "400", subsets: ["latin"], variable: "--font-r-serif" });
const block = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-r-block" });
const round = Bowlby_One_SC({ weight: "400", subsets: ["latin"], variable: "--font-r-round" });

export const metadata: Metadata = {
  title: { default: "PAL", template: "%s · PAL" },
  description: "A personal anime watchlist that plays like a game menu: continue a show, log episodes, clear files.",
};

export const viewport: Viewport = { themeColor: "#D7141A" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={[ui, display, body, serif, block, round].map((f) => f.variable).join(" ")}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
