import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-card border border-border/80 rounded-2xl select-none font-sans">
          <div className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center justify-center mb-3">
            <AlertOctagon size={20} />
          </div>
          <h2 className="text-sm font-bold text-foreground mb-1">Component Render Failed</h2>
          <p className="text-[10px] text-muted-foreground max-w-xs leading-normal mb-4 font-mono break-all bg-background/55 p-2 rounded-lg border border-border/40">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground font-bold text-[10px] px-3.5 py-2 rounded-lg shadow hover:scale-102 transition cursor-pointer"
          >
            <RotateCcw size={11} />
            <span>Try Again</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
export default ErrorBoundary
