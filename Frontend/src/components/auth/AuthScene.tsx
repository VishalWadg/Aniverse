import React, { useId } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

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
    <section className="h-75% w-full overflow-hidden bg-black/55 flex items-center justify-center">
      <div aria-hidden="true" className="pointer-events-none  z-0 hidden xl:block">
        <p className="absolute top-20 right-[-1rem] text-[clamp(8rem,23vw,22rem)] font-black leading-none tracking-[-0.08em] text-white/[0.08]">
          {watermarkTop}
        </p>
        <p className="absolute bottom-[-2rem] left-[-0.5rem] text-[clamp(8rem,23vw,22rem)] font-black leading-none tracking-[-0.08em] text-white/[0.06]">
          {watermarkBottom}
        </p>
      </div>

      <div
        className={cn(
          'mx-auto flex min-h-full w-full items-center justify-center px-4 py-3 sm:px-6 sm:py-4 lg:px-8',
          isSplit ? 'max-w-[1280px]' : 'max-w-[1248px]'
        )}
      >
        <div className={cn('relative z-10 w-full', isSplit ? 'max-w-[1040px]' : 'max-w-[520px]')}>
          {sectionLabel ? (
            <div className="mb-3 flex items-center gap-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#ff453a]">
                {sectionLabel}
              </p>
              <span className="h-px w-16 bg-[#ff453a]" />
            </div>
          ) : null}

          {isSplit ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-8 xl:gap-10">
              <div className="flex flex-col justify-center">
                <h1 className="text-[2.5rem] font-black tracking-[-0.06em] text-[#f5f5f5] sm:text-[3.2rem] lg:text-[3.5rem]">
                  {title}
                </h1>
                <p className="mt-1.5 max-w-md text-sm leading-6 text-[#a3a3a3] sm:text-[15px]">
                  {description}
                </p>

                <div className="mt-5">
                  <p className="text-[13px] text-[#9a9a9a]">
                    {promptLabel}
                  </p>
                  <Link
                    to={promptActionTo}
                    className="mt-2.5 inline-flex border-b-2 border-[#d9d9d9] pb-1 text-lg font-black tracking-[-0.03em] text-[#f5f5f5] transition hover:border-white hover:text-white"
                  >
                    {promptActionLabel}
                  </Link>
                </div>
              </div>

              <div className="w-full border bg-[#141414]/96 px-5 py-4 shadow-[0_32px_80px_rgba(0,0,0,0.45)] sm:px-6 sm:py-5 lg:px-7">
                {error ? (
                  <div className="mb-3 border border-[#ff453a]/30 bg-[#ff453a]/10 px-3.5 py-2 text-sm text-[#ff9b95]">
                    {error}
                  </div>
                ) : null}

                <div className="space-y-1">{children}</div>
              </div>
            </div>
          ) : (
            <div className="w-full  bg-[#141414]/96 px-5 py-2 shadow-[0_32px_80px_rgba(0,0,0,0.45)] sm:px-6 sm:py-5 lg:px-7">
              <h1 className="text-[2.5rem] font-black tracking-[-0.06em] text-[#f5f5f5] sm:text-[3.2rem]">
                {title}
              </h1>
              <p className="mt-1.5 max-w-md text-sm leading-5 text-[#a3a3a3]">
                {description}
              </p>

              {error ? (
                <div className="mt-3 border border-[#ff453a]/30 bg-[#ff453a]/10 px-3.5 py-2 text-sm text-[#ff9b95]">
                  {error}
                </div>
              ) : null}

              <div className="mt-4 space-y-3">{children}</div>

              <div className="mt-5 text-center">
                <p className="text-[13px] text-[#9a9a9a]">
                  {promptLabel}
                </p>
                <Link
                  to={promptActionTo}
                  className="mt-2.5 inline-flex border-b-2 border-[#d9d9d9] pb-1 text-lg font-black tracking-[-0.03em] text-[#f5f5f5] transition hover:border-white hover:text-white"
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

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[13px] font-medium text-[#b0b0b0]"
      >
        {label}
      </label>

      <div className="rounded-sm bg-[#151515] px-3.5 pt-2 pb-1 transition-colors hover:bg-[#181818] focus-within:bg-[#1e1e1e]">
        <input
          id={id}
          ref={ref}
          className={cn(
            'h-9 w-full border-b border-white/12 bg-transparent pb-2 text-[15px] text-[#f5f5f5] outline-none transition-colors placeholder:text-[#a3a3a3] focus:border-[#ff453a]/70',
            className
          )}
          {...props}
        />
      </div>

      {helperLabel && helperHref ? (
        <div className="flex justify-end pt-0.5">
          <a
            href={helperHref}
            className="text-[11px] text-[#8c8c8c] transition hover:text-[#f5f5f5]"
          >
            {helperLabel}
          </a>
        </div>
      ) : null}

      {error ? <p className="text-sm text-[#ff8f88]">{error}</p> : null}
    </div>
  )
})

export { AuthField, AuthScene }
