import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Centered panel for "not found" and error screens. */
export function MessagePanel({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border bg-background px-6 py-12 text-center">
      <Icon aria-hidden className="mb-3 size-8 text-muted-foreground" />
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
