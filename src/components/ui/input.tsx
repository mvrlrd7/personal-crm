import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 border-2 border-ink bg-paper px-3.5 text-16 text-ink transition-colors placeholder:text-ink-muted focus-visible:outline-3 focus-visible:outline-blue disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-page disabled:opacity-50 aria-invalid:border-red aria-invalid:focus-visible:outline-red",
        className
      )}
      {...props}
    />
  )
}

export { Input }
