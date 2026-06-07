import { Toaster } from 'sonner'
import { useTheme } from '@/components/ThemeProvider'

export function ThemeToaster() {
  const { resolvedTheme } = useTheme()

  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme}
      closeButton
      richColors
      duration={4000}
      visibleToasts={3}
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            'border border-outline-variant bg-surface-container text-on-surface shadow-elevation-2 rounded-card p-card theme-transition font-sans',
          title: 'text-sm font-medium text-on-surface',
          description: 'text-xs text-on-surface-variant/75',
          content: 'gap-1',
          icon: 'text-on-surface-variant',
          success: 'border-primary/30 bg-surface-container',
          error: 'border-error/35 bg-surface-container text-error',
          info: 'border-secondary/30 bg-surface-container',
          loading: 'border-outline-variant bg-surface-container',
          closeButton:
            'border border-outline-variant bg-surface-container-high text-on-surface hover:bg-surface-container-highest hover:text-on-surface transition-colors',
        },
      }}
    />
  )
}
