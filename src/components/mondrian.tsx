import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Accent colors of the landing; every contact gets one from its name. */
export type Accent = "blue" | "yellow" | "red";

const ACCENTS: Accent[] = ["blue", "yellow", "red"];

/** Same name always gets the same accent. */
export function accentFor(name: string): Accent {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.codePointAt(0)!) | 0;
  }
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
}

/** Accent as a filled block, with readable text on top of it. */
export const ACCENT_FILL: Record<Accent, string> = {
  blue: "bg-blue text-paper",
  yellow: "bg-yellow text-ink",
  red: "bg-red text-paper",
};

// Color columns of the landing's sample cards, keyed by their top color.
const COLUMNS: Record<Accent, { rows: string; cells: string[] }> = {
  blue: {
    rows: "grid-rows-[2fr_1fr_--spacing(7)_1.4fr]",
    cells: ["bg-blue", "bg-paper", "bg-yellow", "bg-red"],
  },
  yellow: {
    rows: "grid-rows-[1fr_2fr_1fr]",
    cells: ["bg-yellow", "bg-paper", "bg-blue"],
  },
  red: {
    rows: "grid-rows-[--spacing(7)_1.6fr_1fr]",
    cells: ["bg-red", "bg-paper", "bg-yellow"],
  },
};

/**
 * Card from the landing: a white cell and a color column on the right.
 * Black background + 3px gap leave 3px black seams between the cells.
 */
export function MondrianCard({
  accent,
  className,
  children,
}: {
  accent: Accent;
  className?: string;
  children: ReactNode;
}) {
  const column = COLUMNS[accent];

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_--spacing(10)] gap-0.75 border-3 border-ink bg-ink sm:grid-cols-[minmax(0,1fr)_--spacing(16)]",
        className,
      )}
    >
      <div className="min-w-0 bg-paper px-4.5 pt-4.5 pb-5 sm:px-7 sm:pt-7 sm:pb-8">
        {children}
      </div>
      <div aria-hidden className={cn("grid gap-0.75", column.rows)}>
        {column.cells.map((cell, index) => (
          <span key={index} className={cell} />
        ))}
      </div>
    </div>
  );
}
