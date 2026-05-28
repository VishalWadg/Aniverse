import React, { useId } from 'react'

function Select({options, label, className, ...props}, ref) {
    const id = useId();
    return (
      <div className='w-full'>
        {label && <label htmlFor={id} className=''></label>}
        <select 
            id={id} 
            {...props}
            ref={ref}
            className={`px-control-x py-control-y h-control-h rounded-control bg-surface-container text-on-surface outline-none focus:bg-surface-container-high border border-outline-variant w-full transition-colors duration-200 ${className}`}
            >
                {options?.map((option) =>(
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
      </div>
    )
}

export default React.forwardRef(Select);