import * as React from 'react'

import { cn } from '../../lib/utils'

type AlertVariant = 'default' | 'destructive'

const alertBase =
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4'

const alertVariants: Record<AlertVariant, string> = {
  default: 'bg-background text-foreground border-border',
  destructive:
    'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
}

export function Alert({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }) {
  return (
    <div
      role="alert"
      className={cn(alertBase, alertVariants[variant], className)}
      {...props}
    />
  )
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
}

