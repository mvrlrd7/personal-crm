import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Landing CTA: square block, 3px black frame, uppercase; hover inverts the colors.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border-3 border-ink leading-none font-semibold tracking-button whitespace-nowrap uppercase transition-colors duration-150 select-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-yellow text-ink hover:bg-ink hover:text-yellow",
        outline: "bg-paper text-ink hover:bg-ink hover:text-paper",
        secondary: "bg-page text-ink hover:bg-ink hover:text-paper",
        ghost: "border-transparent bg-transparent text-ink hover:bg-page",
        destructive: "bg-red text-paper hover:bg-ink",
        link: "border-transparent bg-transparent text-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 gap-2 px-4 text-13",
        xs: "h-7 gap-1 px-2 text-11 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-3 text-12 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2.5 px-5 text-14 lg:h-14 lg:px-6 lg:text-15",
        icon: "size-11",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
