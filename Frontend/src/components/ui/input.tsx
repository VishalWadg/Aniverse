import * as React from "react"
import { cn } from "@/lib/utils"

function Input({
  className,
  type = "text",
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-control-h w-full rounded-control border border-outline-variant bg-surface-container px-control-x py-control-y text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/45 focus:border-primary focus:bg-surface-container-high focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
