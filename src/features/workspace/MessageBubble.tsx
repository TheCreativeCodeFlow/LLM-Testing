import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Edit2, RotateCw, Bot } from 'lucide-react'
import type { Message } from '@/types'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
  onEditSubmit: (newContent: string) => void
  onRegenerate?: () => void
  isGenerating?: boolean
}

export function MessageBubble({
  message,
  onEditSubmit,
  onRegenerate,
  isGenerating,
}: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant'
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.content)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback copy
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSaveEdit = () => {
    if (editText.trim() && editText.trim() !== message.content) {
      onEditSubmit(editText.trim())
    }
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex w-full gap-4 p-4 rounded-xl border transition-all duration-300",
        isAssistant
          ? "bg-card/30 border-border/40 shadow-sm"
          : "bg-primary/5 border-primary/10 ml-auto max-w-[90%]"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border text-xs font-bold shadow-sm",
          isAssistant
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
        )}
      >
        {isAssistant ? <Bot size={16} /> : 'U'}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            {isAssistant ? 'AI Tutor' : 'You'}
          </span>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1.5 opacity-0 hover:opacity-100 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            {!isAssistant && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                title="Edit Prompt"
              >
                <Edit2 size={11} />
              </button>
            )}
            {isAssistant && (
              <>
                <button
                  onClick={() => handleCopy(message.content)}
                  className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                  title="Copy Message"
                >
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                </button>
                {onRegenerate && !isGenerating && (
                  <button
                    onClick={onRegenerate}
                    className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                    title="Regenerate Response"
                  >
                    <RotateCw size={11} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bubble Body */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full min-h-[80px] rounded-lg border border-primary bg-background/80 p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary/40 font-mono"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setEditText(message.content)
                  setIsEditing(false)
                }}
                className="rounded-lg border border-border px-3 py-1 text-[10px] font-semibold text-foreground hover:bg-accent cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-lg bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer transition"
              >
                Save & Submit
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-foreground leading-relaxed font-sans space-y-3">
            {parseContent(message.content, handleCopy, copied)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Markdown Parser Helper
function parseContent(text: string, onCopy: (text: string) => void, copied: boolean) {
  if (!text) return null

  // Split by code blocks
  const parts = text.split(/(```[\s\S]*?```)/g)

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const firstNewline = part.indexOf('\n')
      const language = part.substring(3, firstNewline === -1 ? undefined : firstNewline).trim() || 'javascript'
      const codeContent = part.substring(firstNewline === -1 ? 3 : firstNewline + 1, part.length - 3).trim()
      return (
        <CodeBlock
          key={index}
          language={language}
          code={codeContent}
          onCopy={onCopy}
          copied={copied}
        />
      )
    }

    // Split text parts into block elements
    return (
      <div key={index} className="space-y-2">
        {parseBlockElements(part)}
      </div>
    )
  })
}

// Block Elements Parser (Tables, Math Blocks, Lists, Paragraphs)
function parseBlockElements(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let tableRows: string[][] = []
  let inTable = false
  let listItems: React.ReactNode[] = []
  let inList = false
  let listType: 'ul' | 'ol' = 'ul'

  const flushTable = (key: number) => {
    if (tableRows.length === 0) return null
    const headers = tableRows[0]
    const bodyRows = tableRows.slice(2) // row 1 is standard divider |---|---|
    inTable = false
    const returnVal = (
      <div key={`table-${key}`} className="my-2.5 overflow-x-auto rounded-lg border border-border/80">
        <table className="min-w-full divide-y divide-border text-left">
          <thead className="bg-secondary/40 font-semibold text-foreground">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 border-r border-border last:border-r-0">
                  {parseInlineStyles(h.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-background/25">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-secondary/20 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-2 border-r border-border last:border-r-0">
                    {parseInlineStyles(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    tableRows = []
    return returnVal
  }

  const flushList = (key: number) => {
    if (listItems.length === 0) return null
    inList = false
    const returnVal = listType === 'ol' ? (
      <ol key={`ol-${key}`} className="list-decimal pl-5 space-y-1 my-2 text-foreground/90">
        {listItems}
      </ol>
    ) : (
      <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1 my-2 text-foreground/90">
        {listItems}
      </ul>
    )
    listItems = []
    return returnVal
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 1. Table parser
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (inList) elements.push(flushList(i))
      inTable = true
      const cells = line.split('|').slice(1, -1)
      tableRows.push(cells)
      continue
    } else if (inTable) {
      elements.push(flushTable(i))
    }

    // 2. Math Block parser ($math$$ or $$math$$)
    if (line.trim().startsWith('$$') && line.trim().endsWith('$$')) {
      if (inList) elements.push(flushList(i))
      const mathExpr = line.trim().slice(2, -2)
      elements.push(
        <div key={`mathblk-${i}`} className="my-3 text-center bg-indigo-500/5 py-2.5 rounded-lg border border-indigo-500/10 font-serif italic text-indigo-400">
          {mathExpr}
        </div>
      )
      continue
    }

    // 3. Lists parser
    const ulMatch = line.match(/^[*-]\s+(.*)/)
    const olMatch = line.match(/^(\d+)\.\s+(.*)/)

    if (ulMatch) {
      if (inTable) elements.push(flushTable(i))
      if (inList && listType !== 'ul') elements.push(flushList(i))
      inList = true
      listType = 'ul'
      listItems.push(<li key={`li-${i}`}>{parseInlineStyles(ulMatch[1])}</li>)
      continue
    } else if (olMatch) {
      if (inTable) elements.push(flushTable(i))
      if (inList && listType !== 'ol') elements.push(flushList(i))
      inList = true
      listType = 'ol'
      listItems.push(<li key={`li-${i}`}>{parseInlineStyles(olMatch[2])}</li>)
      continue
    } else if (inList) {
      elements.push(flushList(i))
    }

    // 4. Standalone paragraphs
    if (line.trim() !== '') {
      elements.push(
        <p key={`p-${i}`} className="leading-relaxed">
          {parseInlineStyles(line)}
        </p>
      )
    }
  }

  // Final flush
  if (inTable) elements.push(flushTable(lines.length))
  if (inList) elements.push(flushList(lines.length))

  return elements
}

// Inline styles (bold, math, code)
function parseInlineStyles(text: string) {
  // Regex patterns
  // Bold: **text**
  // Inline Code: `code`
  // Inline Math: $math$
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\$.*?\$)/g)

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx} className="bg-secondary/60 text-foreground px-1.5 py-0.5 rounded font-mono text-[10.5px]">{part.slice(1, -1)}</code>
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      return <span key={idx} className="font-serif italic text-indigo-400 bg-indigo-500/[0.03] px-1 py-0.25 rounded">{part.slice(1, -1)}</span>
    }
    return part
  })
}

// Custom Syntax Highlighting CodeBlock
interface CodeBlockProps {
  language: string
  code: string
  onCopy: (text: string) => void
  copied: boolean
}

function CodeBlock({ language, code, onCopy, copied }: CodeBlockProps) {
  const codeLines = code.split('\n')

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border/50 bg-[#090d16] text-[#e2e8f0] font-mono text-[11px] leading-[18px]">
      <div className="flex items-center justify-between bg-card/10 px-3.5 py-2 border-b border-border/10 text-[10px] text-muted-foreground tracking-wide font-sans select-none">
        <span>{language}</span>
        <button
          onClick={() => onCopy(code)}
          className="flex items-center gap-1 cursor-pointer hover:text-foreground hover:scale-[1.01] transition-transform"
        >
          {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="flex overflow-x-auto py-2">
        {/* Line Numbers */}
        <div className="w-8 select-none text-right pr-2 text-muted-foreground/30 border-r border-border/10 bg-background/5 text-[10px]">
          {codeLines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Content Highlighted */}
        <pre className="px-3 flex-grow whitespace-pre overflow-x-visible">
          <code>
            {codeLines.map((line, idx) => (
              <div key={idx}>{highlightLine(line)}</div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}

// Simple Javascript/Typescript Highlight tokenizer
function highlightLine(line: string) {
  if (!line) return ' '

  const keywords = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|class|extends|constructor|import|from|export|default|type|interface|as|typeof|new|try|catch|finally|throw|async|await)\b/g
  const types = /\b(number|string|boolean|any|void|unknown|never|null|undefined|Record|Map|Set|Array|ListNode|ListNode\|null)\b/g
  const comments = /(\/\/.*)$/
  const strings = /(["'`].*?["'`])/g

  // Replace sequentially by splitting and building components (simplified tokenization)
  const tokens: React.ReactNode[] = []
  
  // Quick comment check
  const commentMatch = line.match(comments)
  let codePart = line
  let commentPart = ''
  
  if (commentMatch) {
    codePart = line.substring(0, commentMatch.index)
    commentPart = commentMatch[0]
  }

  // Tokenize codePart using regexes in string
  const subParts = codePart.split(/(\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|class|extends|constructor|import|from|export|default|type|interface|as|typeof|new|try|catch|finally|throw|async|await)\b|\b(?:number|string|boolean|any|void|unknown|never|null|undefined|Record|Map|Set|Array|ListNode|ListNode\|null)\b|["'`].*?["'`])/g)

  subParts.forEach((part, index) => {
    if (keywords.test(part)) {
      tokens.push(<span key={index} className="text-[#f472b6] font-semibold">{part}</span>)
    } else if (types.test(part)) {
      tokens.push(<span key={index} className="text-[#38bdf8]">{part}</span>)
    } else if (strings.test(part)) {
      tokens.push(<span key={index} className="text-[#34d399]">{part}</span>)
    } else {
      tokens.push(part)
    }
    // reset regexes state
    keywords.lastIndex = 0
    types.lastIndex = 0
    strings.lastIndex = 0
  })

  if (commentPart) {
    tokens.push(<span key="comment" className="text-[#64748b] italic">{commentPart}</span>)
  }

  return <span>{tokens}</span>
}
export default MessageBubble
