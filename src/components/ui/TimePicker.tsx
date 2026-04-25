'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
}

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  { label, error, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-dark">{label}</label>
      )}
      <div className="relative">
        <Clock
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          ref={ref}
          type="time"
          className={cn(
            'w-full h-11 rounded-xl border bg-white pl-10 pr-3 text-sm text-dark transition focus:outline-none focus:ring-2 focus:ring-primary',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})
