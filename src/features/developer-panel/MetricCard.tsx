import { memo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  icon?: React.ReactNode
  isLoading?: boolean
  className?: string
}

export const MetricCard = memo(function MetricCard({
  title,
  value,
  unit,
  icon,
  isLoading,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-background/40 p-3 flex flex-col gap-1.5 shadow-sm min-w-0 transition-all duration-300",
        isLoading ? "animate-pulse" : "hover:border-border hover:bg-background/60",
        className
      )}
    >
      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
        <span>{title}</span>
        {icon && <span className="text-muted-foreground/60">{icon}</span>}
      </div>

      {isLoading ? (
        <div className="space-y-1.5 py-1">
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.98, opacity: 0.9 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-baseline gap-1"
        >
          <span className="text-sm font-bold text-foreground truncate select-all">{value}</span>
          {unit && <span className="text-[9px] text-muted-foreground/80 font-semibold">{unit}</span>}
        </motion.div>
      )}
    </div>
  )
})
export default MetricCard
