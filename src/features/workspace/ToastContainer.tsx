import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertCircle,
} from 'lucide-react'
import { useWorkspaceStore } from '@/store/workspaceStore'
import type { Toast as ToastType } from '@/types'

export function ToastContainer() {
  const toasts = useWorkspaceStore((state) => state.toasts) || []

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useWorkspaceStore((state) => state.removeToast)

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id)
    }, toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, removeToast])

  const iconMap = {
    success: <CheckCircle size={14} className="text-emerald-400 shrink-0" />,
    error: <AlertCircle size={14} className="text-rose-400 shrink-0" />,
    warning: <AlertTriangle size={14} className="text-amber-400 shrink-0" />,
    info: <Info size={14} className="text-indigo-400 shrink-0" />,
  }

  const borderMap = {
    success: 'border-emerald-500/30 bg-emerald-950/85 text-emerald-200',
    error: 'border-rose-500/30 bg-rose-950/85 text-rose-200',
    warning: 'border-amber-500/30 bg-amber-950/85 text-amber-200',
    info: 'border-indigo-500/30 bg-indigo-950/85 text-indigo-200',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur-md ${borderMap[toast.type]}`}
    >
      {iconMap[toast.type]}
      <div className="flex-grow space-y-0.5 min-w-0 pr-1">
        <p className="text-[10px] font-bold font-sans leading-normal break-words">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-muted-foreground/60 hover:text-foreground cursor-pointer rounded p-0.5 hover:bg-white/10 shrink-0 self-start transition"
      >
        <X size={11} />
      </button>
    </motion.div>
  )
}
export default ToastContainer
