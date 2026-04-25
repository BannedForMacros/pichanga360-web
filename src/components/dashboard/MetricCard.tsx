'use client'

import { ResponsiveContainer, LineChart, Line } from 'recharts'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: React.ReactNode
  trend?: number
  series?: number[]
  color?: 'primary' | 'success' | 'warning'
}

const colorMap = {
  primary: '#1B3F72',
  success: '#00A86B',
  warning: '#F5A623',
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  series = [3, 5, 4, 6, 8, 7, 10],
  color = 'primary',
}: MetricCardProps) {
  const chartColor = colorMap[color]
  const positive = (trend ?? 0) >= 0
  const data = series.map((y, i) => ({ x: i, y }))

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold text-dark">{value}</p>
          {subtitle && (
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              {trend != null && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-semibold',
                    positive ? 'text-success' : 'text-red-500'
                  )}
                >
                  {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(trend)}%
                </span>
              )}
              <span>{subtitle}</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-xl bg-primary-50 p-2 text-primary" aria-hidden>
            {icon}
          </div>
        )}
      </div>
      <div className="h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="y"
              stroke={chartColor}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
