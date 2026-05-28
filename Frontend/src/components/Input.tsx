import React from 'react'
import { Input as UIInput } from './ui/input'

type InputProps = React.ComponentProps<typeof UIInput> & {
  label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="inline-block mb-1.5 pl-1 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
          {label}
        </label>
      )}
      <UIInput ref={ref} className={className} {...props} />
    </div>
  )
})

export default Input
