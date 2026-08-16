import { Button } from "@/components/ui/button"
import { forwardRef } from "react"

export interface IconButtonProps extends React.ComponentProps<typeof Button> {
  icon: React.ReactNode
  ariaLabel: string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, ariaLabel, variant = "ghost", size = "icon", className, ...props }, ref) => {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        ref={ref}
        {...props}
      >
        {icon}
        <span className="sr-only">{ariaLabel}</span>
      </Button>
    )
  }
)
IconButton.displayName = "IconButton"