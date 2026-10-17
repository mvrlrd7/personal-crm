import type { ReactNode } from "react";

import { MondrianCard } from "@/components/mondrian";

/** Card for "not found" and error screens. */
export function MessagePanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <MondrianCard accent="red" className="max-w-xl">
      <h1 className="text-22 leading-title font-semibold lg:text-28">{title}</h1>
      <p className="mt-2.5 text-16 leading-body lg:text-17">{description}</p>
      {children && <div className="mt-6">{children}</div>}
    </MondrianCard>
  );
}
