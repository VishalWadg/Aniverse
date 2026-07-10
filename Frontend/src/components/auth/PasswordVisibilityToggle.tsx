import React, { JSX } from "react"
import { OpenEyeIcon, ClosedEyeIcon } from "./EyeIcon"

type PasswordVisibilityToggleProps = {
  visible: boolean
  onToggle: () => void
}

const PasswordVisibilityToggle = ({
  visible,
  onToggle,
}: PasswordVisibilityToggleProps) => {
  const openEye = <OpenEyeIcon />
  const closedEye = <ClosedEyeIcon />

  return (
    <button
      onClick={onToggle}
      type="button"
      aria-pressed={visible}
      aria-label={visible ? "Hide password" : "Show password"}
    >
      {visible ? closedEye : openEye}
    </button>
  )
}
export { PasswordVisibilityToggle }