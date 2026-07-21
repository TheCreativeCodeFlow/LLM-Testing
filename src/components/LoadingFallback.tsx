import { Loader2 } from 'lucide-react'

export function PanelSkeleton() {
  return (
    <div className="h-full w-full bg-card/60 backdrop-blur-sm border-l border-border/80 p-5 flex flex-col justify-between select-none">
      <div className="space-y-4">
        {/* Header shim */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          <div className="h-4 w-12 rounded-full bg-muted/65 animate-pulse" />
        </div>

        {/* Dynamic Cards shims */}
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-background/35 p-3.5 space-y-2">
              <div className="h-2.5 w-14 rounded bg-muted animate-pulse" />
              <div className="h-3.5 w-24 rounded bg-muted/75 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center py-4">
        <Loader2 size={16} className="text-primary animate-spin" />
      </div>
    </div>
  )
}

export function LibrarySkeleton() {
  return (
    <div className="h-full w-full flex flex-col p-6 space-y-4 select-none">
      {/* Header filter shims */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        <div className="h-8 w-24 rounded-lg bg-muted/75 animate-pulse" />
      </div>

      {/* Library prompt cards shims */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              <div className="h-5 w-12 rounded-full bg-muted/70 animate-pulse" />
            </div>
            <div className="h-10 w-full rounded bg-muted/50 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function GlobalSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-xs select-none">
      <div className="flex flex-col items-center gap-2">
        <Loader2 size={24} className="text-primary animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Loading workspace...</span>
      </div>
    </div>
  )
}
