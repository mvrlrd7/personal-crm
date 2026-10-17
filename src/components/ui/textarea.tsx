import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full border-2 border-ink bg-paper px-3.5 py-3 text-16 leading-body text-ink transition-colors placeholder:text-ink-muted focus-visible:outline-3 focus-visible:outline-blue disabled:cursor-not-allowed disabled:bg-page disabled:opacity-50 aria-invalid:border-red aria-invalid:focus-visible:outline-red",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
