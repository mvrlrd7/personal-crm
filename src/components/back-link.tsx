import Link from "next/link";
import type { ReactNode } from "react";

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-13 leading-none font-medium tracking-button uppercase hover:opacity-85 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue lg:text-14"
    >
      <span aria-hidden className="text-16 lg:text-18">
        ←
      </span>
      {children}
    </Link>
  );
}
