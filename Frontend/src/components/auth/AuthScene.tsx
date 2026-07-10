import React, { useId } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { PasswordVisibilityToggle } from './PasswordVisibilityToggle'

type AuthSceneProps = {
  sectionLabel?: string
  title: string
  description: string
  promptLabel: string
  promptActionLabel: string
  promptActionTo: string
  watermarkTop: string
  watermarkBottom: string
  layout?: 'stacked' | 'split'
  error?: string
  children: React.ReactNode
}

function AuthScene({
  sectionLabel,
  title,
  description,
  promptLabel,
  promptActionLabel,
  promptActionTo,
  watermarkTop,
  watermarkBottom,
  layout = 'stacked',
  error,
  children,
}: AuthSceneProps) {
  const isSplit = layout === 'split'

  return (
    <section className="min-h-[calc(100vh-9rem)] w-full overflow-hidden bg-background flex items-center justify-center py-section">
      <div aria-hidden="true" className="pointer-events-none z-0 hidden xl:block">
        <p className="absolute top-20 right-[-1rem] text-[clamp(8rem,23vw,22rem)] font-black leading-none tracking-[-0.08em] text-on-surface/[0.04]">
          {watermarkTop}
        </p>
        <p className="absolute bottom-[-2rem] left-[-0.5rem] text-[clamp(8rem,23vw,22rem)] font-black leading-none tracking-[-0.08em] text-on-surface/[0.03]">
          {watermarkBottom}
        </p>
      </div>

      <div
        className={cn(
          'mx-auto flex min-h-full w-full items-center justify-center px-page py-4',
          isSplit ? 'max-w-[1280px]' : 'max-w-[1248px]'
        )}
      >
        <div className={cn('relative z-10 w-full', isSplit ? 'max-w-[1040px]' : 'max-w-[520px]')}>
          {sectionLabel ? (
            <div className="mb-3 flex items-center gap-4">
              <p className="text-[11px] font-black uppercase tracking-[0.32em] text-primary">
                {sectionLabel}
              </p>
              <span className="h-px w-16 bg-primary" />
            </div>
          ) : null}

          {isSplit ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-8 xl:gap-10">
              <div className="flex flex-col justify-center">
                <h1 className="text-[2.5rem] font-black tracking-[-0.06em] text-on-surface sm:text-[3.2rem] lg:text-[3.5rem]">
                  {title}
                </h1>
                <p className="mt-1.5 max-w-md text-sm leading-6 text-on-surface-variant sm:text-[15px]">
                  {description}
                </p>

                <div className="mt-5">
                  <p className="text-[13px] text-on-surface-variant/80">
                    {promptLabel}
                  </p>
                  <Link
                    to={promptActionTo}
                    className="mt-2.5 inline-flex border-b-2 border-outline-variant pb-1 text-lg font-black tracking-[-0.03em] text-on-surface transition hover:border-primary hover:text-primary"
                  >
                    {promptActionLabel}
                  </Link>
                </div>
              </div>

              <div className="w-full border border-outline-variant rounded-card bg-surface-container p-card shadow-elevation-2">
                {error ? (
                  <div className="mb-3 border border-error/30 bg-error/10 rounded-control px-3.5 py-2 text-sm text-error">
                    {error}
                  </div>
                ) : null}

                <div className="space-y-3">{children}</div>
              </div>
            </div>
          ) : (
            <div className="w-full border border-outline-variant rounded-card bg-surface-container p-card shadow-elevation-2">
              <h1 className="text-[2.5rem] font-black tracking-[-0.06em] text-on-surface sm:text-[3.2rem]">
                {title}
              </h1>
              <p className="mt-1.5 max-w-md text-sm leading-5 text-on-surface-variant">
                {description}
              </p>

              {error ? (
                <div className="mt-3 border border-error/30 bg-error/10 rounded-control px-3.5 py-2 text-sm text-error">
                  {error}
                </div>
              ) : null}

              <div className="mt-4 space-y-3">{children}</div>

              <div className="mt-5 text-center">
                <p className="text-[13px] text-on-surface-variant/80">
                  {promptLabel}
                </p>
                <Link
                  to={promptActionTo}
                  className="mt-2.5 inline-flex border-b-2 border-outline-variant pb-1 text-lg font-black tracking-[-0.03em] text-on-surface transition hover:border-primary hover:text-primary"
                >
                  {promptActionLabel}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

const AuthField = React.forwardRef(function AuthField(
  {
    label,
    error,
    helperLabel,
    helperHref,
    className,
    type,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string
    error?: string
    helperLabel?: string
    helperHref?: string
  },
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const id = useId()

  const isPasswordField = type === 'password'
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)
  const localRef = React.useRef<HTMLInputElement | null>(null)
  const setRef = React.useCallback((el: HTMLInputElement | null) => {
    localRef.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = el
  }, [ref])
  const resolvedType = isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-on-surface-variant"
      >
        {label}
      </label>
      <div className="flex items-center rounded-control bg-surface-container-low border border-outline-variant/60 px-control-x py-1 transition-colors hover:bg-surface-container focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
        <input
          id={id}
          ref={setRef}
          type={resolvedType}
          className={cn(
            'flex-1 h-control-h border-0 bg-transparent text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/45',
            className
          )}
          {...props}
        />

        { 
        /* Toggle password visibility button if the field is a password field */
        isPasswordField && (
          <div className="flex items-center">    
            <PasswordVisibilityToggle
              visible={isPasswordVisible}
              onToggle={() => {
                setIsPasswordVisible((value) => !value)
                localRef.current?.focus()
              }}
            />
          </div>
        )}

      </div>

      {helperLabel && helperHref ? (
        <div className="flex justify-end pt-0.5">
          <a
            href={helperHref}
            className="text-[11px] text-on-surface-variant/70 transition hover:text-primary"
          >
            {helperLabel}
          </a>
        </div>
      ) : null}

      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  )
})

export { AuthField, AuthScene }
