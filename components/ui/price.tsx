import * as React from 'react'

import { cn } from '@/lib/utils'

function formatAmount(amount: number, forceTwoDecimals = false) {
  return new Intl.NumberFormat('bg-BG', {
    minimumFractionDigits: forceTwoDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatEuro(value: number) {
  return `€${formatAmount(value)}`
}

/** @deprecated Use formatEuro - kept for existing chart formatters */
function formatPriceWithBgn(value: number) {
  return formatEuro(value)
}

interface PriceProps extends React.ComponentProps<'span'> {
  /** Euro amount */
  value: number
  /** @deprecated No longer affects layout; prices are shown in EUR only */
  layout?: 'horizontal' | 'vertical' | 'responsive'
}

function Price({ value, className, ...props }: PriceProps) {
  return (
    <span
      data-slot="price"
      className={cn('inline-flex font-semibold tabular-nums', className)}
      {...props}
    >
      {formatEuro(value)}
    </span>
  )
}

export { Price, formatEuro, formatPriceWithBgn }
