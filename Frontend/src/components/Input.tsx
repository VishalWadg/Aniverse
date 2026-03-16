import React, { useId } from "react"

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({
    label,
    type='text',
    className='',
    ...props
}, ref){
    const id = useId();
    return (
        <div className="w-full">
            {
                label && <label
                className="inline-block mb-1 pl-1"
                htmlFor={id}
                >{label}
                </label>
            }
            <input
                id={id}
                type={type} 
                className={`px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full ${className}`}
                {...props}
                ref={ref}
            />
        </div>
    )
})

export default Input
