import { ACCENT_FILL, accentFor } from "@/components/mondrian";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Square block in the contact's accent color with initials. */
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
        "flex size-9 shrink-0 items-center justify-center text-13 leading-none font-semibold",
        ACCENT_FILL[accentFor(name)],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
