import * as React from 'react'
import { MinusIcon } from 'lucide-react'

function InputOTPSeparator({ ...props }: React.ComponentProps<'span'>) {
  return (
    <span data-slot="input-otp-separator" aria-hidden="true" {...props}>
      <MinusIcon />
    </span>
  )
}

export { InputOTPSeparator }
