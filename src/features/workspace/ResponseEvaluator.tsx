import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ThumbsUp, ThumbsDown, Check, Sparkles } from 'lucide-react'
import { useWorkspaceStore } from '@/store/workspaceStore'

interface ResponseEvaluatorProps {
  messageId: string
  messageContent: string
}

const METRICS_LIST = [
  { key: 'technicalCorrectness', label: 'Technical Correctness' },
  { key: 'educationalQuality', label: 'Educational Quality' },
  { key: 'hintQuality', label: 'Hint Quality' },
  { key: 'logicalConsistency', label: 'Logical Consistency' },
  { key: 'beginnerFriendliness', label: 'Beginner Friendliness' },
  { key: 'overallScore', label: 'Overall Score' },
]

export function ResponseEvaluator({ messageId, messageContent }: ResponseEvaluatorProps) {
  const { addConsoleLog, activeCategory, activeConversationId } = useWorkspaceStore()
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Rating states (1-5 stars)
  const [ratings, setRatings] = useState<Record<string, number>>({
    technicalCorrectness: 0,
    educationalQuality: 0,
    hintQuality: 0,
    logicalConsistency: 0,
    beginnerFriendliness: 0,
    overallScore: 0,
  })

  const [hoveredMetric, setHoveredMetric] = useState<Record<string, number>>({})
  const [sentiment, setSentiment] = useState<'GOOD' | 'BAD' | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Star Rating Picker helper
  const renderStars = (metricKey: string) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isSelected = star <= ratings[metricKey]
          const isHovered = star <= (hoveredMetric[metricKey] || 0)
          return (
            <button
              key={star}
              type="button"
              onClick={() => setRatings((prev) => ({ ...prev, [metricKey]: star }))}
              onMouseEnter={() => setHoveredMetric((prev) => ({ ...prev, [metricKey]: star }))}
              onMouseLeave={() => setHoveredMetric((prev) => ({ ...prev, [metricKey]: 0 }))}
              className="p-0.5 cursor-pointer text-muted-foreground/40 hover:text-amber-400 hover:scale-110 active:scale-95 transition-all duration-150"
            >
              <Star
                size={13}
                className={`${
                  isSelected || isHovered
                    ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_1px_rgba(251,191,36,0.3)]'
                    : 'text-muted-foreground/30'
                }`}
              />
            </button>
          )
        })}
      </div>
    )
  }

  // Handle saving feedback
  const handleSaveFeedback = () => {
    // Basic validation
    const hasRatings = Object.values(ratings).some((val) => val > 0)
    if (!sentiment && !hasRatings && !feedback.trim()) return

    const feedbackPayload = {
      messageId,
      conversationId: activeConversationId,
      tutorMode: activeCategory,
      sentiment: sentiment || 'UNSPECIFIED',
      ratings,
      feedbackText: feedback.trim(),
      timestamp: Date.now(),
      promptPreview: messageContent.substring(0, 80) + '...',
    }

    if (sentiment === 'BAD') {
      // Compile highly structured failure signature report
      const failureReport = {
        reportType: 'LLM_TUNING_FAILURE_AUDIT',
        signature: `AUDIT_FAIL_${messageId.substring(0, 8).toUpperCase()}`,
        telemetry: {
          ...feedbackPayload,
          status: 'INSPECT_REQUIRED',
          incidentSeverity: ratings.technicalCorrectness <= 2 ? 'HIGH' : 'MEDIUM',
          suggestedRemediation: ratings.hintQuality <= 2 ? 'INCREASE_EXAMPLES' : 'RE_ESTABLISH_CONTEXT'
        },
        payloadDump: {
          fullContent: messageContent,
        }
      }

      addConsoleLog(`[Feedback API] ⚠️ Telemetry incident reported. Staging failure object:`)
      addConsoleLog(JSON.stringify(failureReport, null, 2))
    } else {
      addConsoleLog(`[Feedback API] Success. Submitted response evaluator payload:`)
      addConsoleLog(JSON.stringify(feedbackPayload, null, 2))
    }

    setIsSubmitted(true)
    setTimeout(() => {
      setIsExpanded(false)
      setIsSubmitted(false)
      // reset states
      setRatings({
        technicalCorrectness: 0,
        educationalQuality: 0,
        hintQuality: 0,
        logicalConsistency: 0,
        beginnerFriendliness: 0,
        overallScore: 0,
      })
      setSentiment(null)
      setFeedback('')
    }, 1800)
  }

  return (
    <div className="mt-3 border-t border-border/20 pt-2 select-none">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 font-medium">
        <span>Was this tutor response helpful?</span>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSentiment('GOOD')
              setIsExpanded(true)
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded cursor-pointer border transition-all ${
              sentiment === 'GOOD'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold'
                : 'border-border hover:bg-accent hover:text-foreground'
            }`}
          >
            <ThumbsUp size={9} />
            <span>Good</span>
          </button>
          
          <button
            onClick={() => {
              setSentiment('BAD')
              setIsExpanded(true)
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded cursor-pointer border transition-all ${
              sentiment === 'BAD'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 font-bold animate-pulse'
                : 'border-border hover:bg-accent hover:text-foreground'
            }`}
          >
            <ThumbsDown size={9} />
            <span>Bad</span>
          </button>

          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-[9px] text-primary font-bold hover:underline cursor-pointer ml-1 pl-1 border-l border-border/30"
            >
              ⭐ Rate Stars
            </button>
          )}
        </div>
      </div>

      {/* Expandable Evaluation Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {isSubmitted ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center justify-center py-6 text-center text-emerald-500 space-y-1.5"
              >
                <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Check size={14} className="animate-bounce" />
                </div>
                <span className="text-[10px] font-bold">Feedback Saved Successfully!</span>
                <span className="text-[8px] text-muted-foreground">Thank you for helping refine the DSA Tutor.</span>
              </motion.div>
            ) : (
              <div className="space-y-3.5 mt-3 rounded-lg border border-border/60 bg-secondary/15 p-3 animate-in fade-in-50 duration-200">
                <div className="text-[9px] font-bold text-foreground flex items-center gap-1 border-b border-border/20 pb-1.5">
                  <Sparkles size={11} className="text-primary animate-pulse" />
                  <span>AI Response Telemetry Evaluation</span>
                </div>

                {/* 6 Grid Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {METRICS_LIST.map((metric) => (
                    <div key={metric.key} className="flex items-center justify-between py-0.5">
                      <span className="text-[10px] font-semibold text-foreground/80">{metric.label}</span>
                      {renderStars(metric.key)}
                    </div>
                  ))}
                </div>

                {/* Text comment field */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Optional Comments</label>
                  <textarea
                    rows={2}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={
                      sentiment === 'BAD'
                        ? "Please detail what was incorrect or could be improved to help audit the LLM parameters..."
                        : "What did you find helpful? (e.g. coding details, visualizer explanations...)"
                    }
                    className="w-full rounded-lg border border-border bg-background/50 px-2.5 py-1.5 text-[10px] outline-none resize-none focus:border-primary/80 focus:ring-1 focus:ring-primary/20 font-sans"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-1.5 pt-1 border-t border-border/20">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="rounded-lg border border-border px-3 py-1 text-[9px] font-bold hover:bg-accent transition cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveFeedback}
                    className="rounded-lg bg-primary text-primary-foreground font-bold px-4 py-1 text-[9px] shadow hover:scale-102 active:scale-95 transition cursor-pointer"
                  >
                    Save Feedback
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default ResponseEvaluator
