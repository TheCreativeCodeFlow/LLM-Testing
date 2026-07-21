import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, StopCircle, Paperclip, X, FileCode, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspaceStore'

export interface Attachment {
  name: string
  size: string
  content?: string
}

interface ChatInputProps {
  onSubmit: (text: string, attachments: Attachment[]) => void
  onStop: () => void
  isGenerating: boolean
  placeholder?: string
}

export function ChatInput({ onSubmit, onStop, isGenerating, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
  }, [value])

  // Listen for draft prompts from the prompt library
  const draftPrompt = useWorkspaceStore((state) => state.draftPrompt)
  const setDraftPrompt = useWorkspaceStore((state) => state.setDraftPrompt)

  useEffect(() => {
    if (draftPrompt) {
      setTimeout(() => {
        setValue(draftPrompt)
        setDraftPrompt('')
        textareaRef.current?.focus()
      }, 0)
    }
  }, [draftPrompt, setDraftPrompt])

  // Clear input states when generation completes or starting
  const handleSubmit = () => {
    if ((!value.trim() && attachments.length === 0) || isGenerating) return

    // Build the final prompt carrying attachment descriptions if present
    let finalPrompt = value
    if (attachments.length > 0) {
      const attachmentsText = attachments
        .map((a) => `[Attachment: ${a.name}]\n\`\`\`\n${a.content || 'File attached'}\n\`\`\``)
        .join('\n\n')
      finalPrompt = `${attachmentsText}\n\n${value}`
    }

    onSubmit(finalPrompt, attachments)
    setValue('')
    setAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  // Handle key shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const shortcutsEnabled = useWorkspaceStore.getState().shortcutsEnabled !== false
    if (!shortcutsEnabled) return

    const isEnter = e.key === 'Enter'
    const isCmdOrCtrl = e.metaKey || e.ctrlKey

    if (isEnter) {
      if (isCmdOrCtrl) {
        e.preventDefault()
        handleSubmit()
      } else if (!e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    }
  }

  // Handle pasted text to detect code blocks
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text')
    
    // Check if the pasted text looks like code
    const codeKeywords = /\b(const|let|function|return|import|class|export|interface|struct|def|fn)\b/
    const hasCurlyBraces = pastedText.includes('{') && pastedText.includes('}')
    
    if (codeKeywords.test(pastedText) || hasCurlyBraces) {
      // Auto wrap in markdown code blocks if not already wrapped
      if (!pastedText.trim().startsWith('```') && !value.includes(pastedText)) {
        e.preventDefault()
        const currentCursor = textareaRef.current?.selectionStart || 0
        const before = value.substring(0, currentCursor)
        const after = value.substring(textareaRef.current?.selectionEnd || 0)
        
        const wrappedText = `\n\`\`\`typescript\n${pastedText}\n\`\`\`\n`
        setValue(before + wrappedText + after)
        
        // Console notification
        useWorkspaceStore.getState().addConsoleLog('Code snippet pasted. Automatically formatted into markdown code block.')
      }
    }
  }

  // File drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files)
      
      for (const file of filesArray) {
        const text = await file.text().catch(() => 'Binary file content')
        const sizeKb = Math.ceil(file.size / 1024)
        
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: `${sizeKb} KB`,
            content: text,
          },
        ])
        
        useWorkspaceStore.getState().addConsoleLog(`File attached: ${file.name} (${sizeKb} KB)`)
      }
    }
  }

  // Manual file input trigger
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      
      for (const file of filesArray) {
        const text = await file.text().catch(() => 'Binary file content')
        const sizeKb = Math.ceil(file.size / 1024)
        
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: `${sizeKb} KB`,
            content: text,
          },
        ])
      }
      e.target.value = '' // reset input
    }
  }

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  // Word-based token estimator
  const wordsCount = value.trim().split(/\s+/).filter(Boolean).length
  const tokenEstimation = Math.ceil(wordsCount * 1.3 + value.length * 0.2)

  // Validation warnings
  const isTooLong = value.length > 2000

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative w-full max-w-3xl mx-auto"
    >
      {/* Drag overlay zone */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-background/90 backdrop-blur-sm text-primary select-none pointer-events-none"
          >
            <Paperclip size={28} className="animate-bounce mb-2" />
            <span className="text-xs font-bold">Drop files here to upload context</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "rounded-2xl border bg-card/65 backdrop-blur-md p-2 transition-all duration-300 relative z-10 shadow-lg flex flex-col gap-1.5",
          isFocused ? "border-primary/80 ring-2 ring-primary/20 shadow-primary/5" : "border-border/80"
        )}
      >
        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2 pt-1 pb-1 border-b border-border/20">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 rounded-lg bg-secondary/65 border border-border/80 pl-2 pr-1 py-1 text-[10px] font-semibold text-foreground animate-in fade-in zoom-in-95"
              >
                <FileCode size={11} className="text-indigo-400" />
                <span className="truncate max-w-[120px]">{file.name}</span>
                <span className="text-[8px] text-muted-foreground">({file.size})</span>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="rounded hover:bg-muted p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text area and Actions split */}
        <div className="flex items-start gap-2 min-h-[36px]">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-8 w-8 cursor-pointer shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground transition"
            title="Attach Code File (Drag & Drop supported)"
          >
            <Paperclip size={13} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".ts,.tsx,.js,.jsx,.json,.txt,.md"
          />

          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder || "Type a prompt, paste code snippets, or drop files..."}
            className="flex-grow resize-none bg-transparent py-1.5 px-1 text-xs text-foreground outline-none border-none focus:ring-0 placeholder:text-muted-foreground/80 leading-normal scrollbar-none font-sans min-h-[30px]"
            maxLength={2200}
          />

          {isGenerating ? (
            <button
              onClick={onStop}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition shadow-sm"
              title="Stop Generation"
            >
              <StopCircle size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!value.trim() && attachments.length === 0}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-primary text-primary-foreground shadow hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed transition"
              title="Send Prompt (Ctrl + Enter)"
            >
              <Send size={13} />
            </button>
          )}
        </div>

        {/* Counter Indicators footer */}
        <div className="flex items-center justify-between px-2 text-[9px] text-muted-foreground/80 select-none">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              <Sparkles size={9} className="text-primary animate-pulse" />
              <span>Est. {tokenEstimation} tokens</span>
            </span>
            <span className="text-muted-foreground/30">|</span>
            <span>Shift + Enter for newlines</span>
          </div>

          <div className={cn("font-medium", isTooLong && "text-destructive font-semibold")}>
            {value.length} / 2000 chars
          </div>
        </div>
      </div>
    </div>
  )
}
export default ChatInput
