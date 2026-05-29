import React from 'react'
import { Button as UIButton } from './ui/button'

type ButtonProps = React.ComponentProps<typeof UIButton>;

function Button(props: ButtonProps) {
  return <UIButton {...props} />
}

export default Button
