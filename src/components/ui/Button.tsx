'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary',
  secondary:
    'bg-primary-50 text-primary hover:bg-primary-100 focus-visible:ring-primary',
  outline:
    'border border-primary text-primary bg-transparent hover:bg-primary-50 focus-visible:ring-primary',
  ghost:
    'bg-transparent text-primary hover:bg-primary-50 focus-visible:ring-primary',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500',
  warning:
    'bg-warning text-white hover:bg-warning-600 focus-visible:ring-warning',
  success:
    'bg-success text-white hover:bg-success-600 focus-visible:ring-success',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-12 px-6 text-base rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading,
    disabled,
    fullWidth,
    leftIcon,
    rightIcon,
    children,
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" className="text-current" /> : leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  )
})
