'use client'

import * as React from 'react'
import { OTPInput } from 'input-otp'

import { cn } from '@/lib/utils'
export { InputOTPGroup } from '@/components/ui/input-otp-group'
export { InputOTPSeparator } from '@/components/ui/input-otp-separator'
export { InputOTPSlot } from '@/components/ui/input-otp-slot'

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        'flex items-center gap-2 has-disabled:opacity-50',
        containerClassName,
      )}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}

export { InputOTP }
