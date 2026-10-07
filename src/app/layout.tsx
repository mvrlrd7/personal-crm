import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { UsersRoundIcon } from "lucide-react";

import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

import "./globals.css";

const geist = Geist({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
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
    <html lang="ru" className={cn("font-sans", geist.variable)}>
      <body className="min-h-dvh bg-muted/40 antialiased">
        <header className="border-b bg-background">
          <div className="mx-auto flex h-14 max-w-5xl items-center px-4 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <UsersRoundIcon className="size-4" aria-hidden />
              </span>
              Личная CRM
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
        <Toaster theme="light" position="bottom-right" />
      </body>
    </html>
  );
}
