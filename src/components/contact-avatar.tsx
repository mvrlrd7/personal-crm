import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-sky-100 text-sky-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-violet-100 text-violet-800",
  "bg-teal-100 text-teal-800",
  "bg-orange-100 text-orange-800",
  "bg-indigo-100 text-indigo-800",
];

/** Same name always gets the same color. */
function colorFor(name: string): string {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.codePointAt(0)!) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function ContactAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-medium",
        colorFor(name),
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
