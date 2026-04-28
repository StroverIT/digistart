import * as React from 'react'

import { cn } from '@/lib/utils'

const EUR_TO_BGN = 1.95583

function formatAmount(amount: number, forceTwoDecimals = false) {
  return new Intl.NumberFormat('bg-BG', {
    minimumFractionDigits: forceTwoDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatEuro(value: number) {
  return `€${formatAmount(value)}`
}

function formatBgn(value: number) {
  return `${formatAmount(value * EUR_TO_BGN, true)} лв.`
}

function formatPriceWithBgn(value: number) {
  return `${formatEuro(value)} (${formatBgn(value)})`
}

interface PriceProps extends React.ComponentProps<'span'> {
  /** Euro value used as source for conversion */
  value: number
  /** Controls alignment between EUR and BGN values. */
  layout?: 'horizontal' | 'vertical'
}

function Price({ value, className, layout = 'horizontal', ...props }: PriceProps) {
  const euro = formatEuro(value)
  const bgn = formatBgn(value)
  const isVertical = layout === 'vertical'

  return (
    <span
      data-slot="price"
      className={cn(
        'inline-flex',
        isVertical ? 'flex-col items-start gap-1' : 'items-center gap-2',
        className
      )}
      {...props}
    >
      <span className="font-semibold tabular-nums">{euro}</span>
      <span className="text-muted-foreground tabular-nums">({bgn})</span>
    </span>
  )
}

export { Price, EUR_TO_BGN, formatEuro, formatBgn, formatPriceWithBgn }
