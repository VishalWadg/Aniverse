import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'


type ThemeSettingsPopoverProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: React.ReactNode   // the button that goes in PopoverTrigger
  children: React.ReactNode  // whatever goes inside PopoverContent
  sideOffset?: number
  options?: string
}
const settingsPanelClassName = "w-[min(18rem,calc(100vw-2rem))] rounded-card border border-outline-variant bg-surface-container-highest shadow-elevation-2"

function ThemeSettingsPopover({ open, onOpenChange, trigger, children, sideOffset = 8, options}: ThemeSettingsPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={sideOffset} className={cn(settingsPanelClassName, options)}>
        {children}
      </PopoverContent>
    </Popover>
  )
}

export default ThemeSettingsPopover;