import React from 'react'
import { cn } from '@/lib/utils'

export interface LogoProps {
  width?: string
  className?: string
  showText?: boolean
  hideTextOnMobile?: boolean
  variant?: 'dynamic' | 'original'
  iconClassName?: string
  iconContainerClassName?: string
  textClassName?: string
}

function Logo({
  width = 'auto',
  className = '',
  showText = true,
  hideTextOnMobile = false,
  variant = 'dynamic',
  iconClassName = 'h-10 w-10 sm:h-11 sm:w-11 scale-130 sm:scale-180',
  iconContainerClassName = 'h-10 w-10 sm:h-10 sm:w-10',
  textClassName = ''
}: LogoProps) {
  return (
    <div 
      style={{ width }} 
      className={cn("flex items-center gap-3 sm:gap-3.5 shrink-0 group cursor-pointer select-none", className)}
    >
      {/* Icon layout container */}
      <div className={cn("relative shrink-0 flex items-center justify-center", iconContainerClassName)}>
        {variant === 'dynamic' ? (
          <>
            {/* Dynamic ambient glow matching active theme brand color */}
            <div 
              className="absolute inset-0 rounded-full blur-md opacity-35 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none"
              style={{ backgroundColor: 'var(--primary)' }}
            />
            {/* Dynamic contrasting logo SVG mask visually scaled up */}
            <div
              className={cn(
                "relative transition-transform duration-300 group-hover:scale-140 sm:group-hover:scale-190",
                iconClassName
              )}
              style={{
                backgroundColor: 'var(--primary)',
                maskImage: `url(${import.meta.env.BASE_URL}AniverseLogo.svg)`,
                WebkitMaskImage: `url(${import.meta.env.BASE_URL}AniverseLogo.svg)`,
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                filter: 'drop-shadow(0 2px 4px color-mix(in srgb, var(--primary) 35%, transparent))'
              }}
              aria-label="Aniverse Logo"
            />
          </>
        ) : (
          <img 
            src={`${import.meta.env.BASE_URL}AniverseLogo.svg`}
            alt="Aniverse Logo" 
            className={cn("object-contain transition-transform duration-300 group-hover:scale-135 sm:group-hover:scale-140", iconClassName)} 
          />
        )}
      </div>

      {/* Brand Text (Hidden on mobile if hideTextOnMobile is true) */}
      {showText && (
        <span 
          className={cn(
            "font-black text-lg sm:text-xl tracking-tighter text-on-surface group-hover:text-primary transition-colors duration-200 uppercase leading-none",
            hideTextOnMobile && "hidden sm:inline-block",
            textClassName
          )}
          style={{ fontFamily: "'Figtree Variable', sans-serif" }}
        >
          ANIVERSE
        </span>
      )}
    </div>
  )
}

export default Logo
