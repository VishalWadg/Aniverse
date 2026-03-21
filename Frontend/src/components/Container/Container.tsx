import React from 'react'
import { cn } from '@/lib/utils'

function Container({children, className=''}) {
  return (
    <div className={cn('mx-auto w-full max-w-[1248px] px-4 sm:px-6 lg:px-8', className)}>
        {children}
    </div>
  )
}

export default Container
