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
        "flex h-10 w-full rounded-none border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-[#e5e5e5] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition-colors placeholder:text-[#666666] focus:border-[#ff453a]/70 focus:bg-white/[0.04] focus-visible:ring-[3px] focus-visible:ring-[#ff453a]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
