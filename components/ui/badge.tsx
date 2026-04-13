import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-violet-600 text-white shadow",
        secondary:
          "border-transparent bg-zinc-800 text-white",
        destructive:
          "border-transparent bg-red-600 text-white shadow",
        outline: "border-zinc-700 text-zinc-300",
        success:
          "border-transparent bg-emerald-600 text-white shadow",
        warning:
          "border-transparent bg-amber-600 text-white shadow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
