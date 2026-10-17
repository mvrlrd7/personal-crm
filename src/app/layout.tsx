import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import Link from "next/link";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

// The landing's font.
const golosText = Golos_Text({
  subsets: ["latin", "cyrillic"],
  variable: "--font-golos-text",
});

export const metadata: Metadata = {
  title: {
    template: "%s — Личная CRM",
    default: "Личная CRM",
  },
  description: "Люди, которых я знаю лично, и контекст общения с ними",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={golosText.variable}>
      <body className="antialiased">
        {/* As on the landing: a white column on a light gray page. */}
        <div className="mx-auto flex min-h-dvh max-w-page flex-col bg-paper">
          <header className="mx-6 flex h-15.5 shrink-0 items-center border-b-2 border-ink lg:mx-12 lg:h-19.5">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-14 leading-none font-semibold tracking-button whitespace-nowrap uppercase hover:opacity-85 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue lg:gap-3 lg:text-15"
            >
              <span aria-hidden className="size-3 shrink-0 bg-red lg:size-3.5" />
              Личная CRM
            </Link>
          </header>
          <main className="flex-1 px-6 pt-6 pb-12 lg:px-12 lg:pt-10 lg:pb-22">
            {children}
          </main>
        </div>
        <Toaster theme="light" position="bottom-right" />
      </body>
    </html>
  );
}
