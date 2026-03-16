import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    bgColor?: string;
    textColor?: string;
};

function Button({
    children,
    type = 'button',
    bgColor = 'bg-blue-600',
    textColor = 'text-white',
    className = '',
    ...props
}: ButtonProps) {
  return (
    <button
        className={`px-4 py-2 ${className} ${bgColor} ${textColor}`}
        type={type}
        {...props}
    >{children}</button>
  )
}

export default Button
