import { useWorkspaceStore } from '@/store/workspaceStore'

const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:8000'
}

// Exponential backoff sleep helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface StreamOptions {
  onChunk: (text: string) => void
  signal?: AbortSignal
}

export const apiService = {
  /**
   * Health monitor checking FastAPI server availability
   */
  async checkHealth(): Promise<boolean> {
    const baseUrl = getApiBaseUrl()
    const store = useWorkspaceStore.getState()

    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        // short timeout for health check
        signal: AbortSignal.timeout(3000),
      })

      const isOnline = response.ok
      if (isOnline !== store.apiOnline) {
        store.setApiOnline(isOnline)
        if (isOnline) {
          store.addConsoleLog('[System] Connection established to FastAPI backend.')
          store.addToast('FastAPI Backend connected successfully.', 'success', 3000)
        } else {
          store.addConsoleLog('[System] FastAPI backend returned non-OK status on health check.')
          store.addToast('API server returned an unhealthy response.', 'warning', 4000)
        }
      }
      return isOnline
    } catch {
      if (store.apiOnline) {
        store.setApiOnline(false)
        store.addConsoleLog('[System] FastAPI backend server is unreachable.')
        store.addToast('API connection lost. Backend server is offline.', 'error', 5000)
      }
      return false
    }
  },

  /**
   * Stream LLM/Tutor responses with built-in retries and abort signals
   */
  async streamTutorResponse(
    category: string,
    prompt: string,
    options: StreamOptions,
    maxRetries = 3
  ): Promise<void> {
    const baseUrl = getApiBaseUrl()
    const store = useWorkspaceStore.getState()

    // Match prompt category to specific FastAPI endpoints
    let endpoint = '/chat'
    if (category === 'Hint Mode') endpoint = '/hint'
    else if (category === 'Debugging') endpoint = '/debug'
    else if (category === 'Code Review') endpoint = '/review'
    else if (category === 'Concept Learning') endpoint = '/complexity'

    let attempt = 0
    let backoffDelay = 500 // starts at 500ms

    while (attempt <= maxRetries) {
      try {
        if (options.signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError')
        }

        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
          signal: options.signal,
        })

        if (!response.ok) {
          throw new Error(`API server returned code ${response.status}`)
        }

        if (!response.body) {
          throw new Error('API server returned empty response body stream.')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let done = false

        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone

          if (value) {
            const chunkStr = decoder.decode(value, { stream: true })
            
            // Check if chunk is formatted as SSE (data: [content])
            const sseLines = chunkStr.split('\n')
            let decodedText = ''
            
            for (const line of sseLines) {
              if (line.trim().startsWith('data:')) {
                const sseData = line.substring(5).trim()
                if (sseData === '[DONE]') {
                  done = true
                  break
                }
                decodedText += sseData
              } else if (line.trim() !== '') {
                // fallback to raw text if not SSE formatted
                decodedText += line
              }
            }

            if (decodedText) {
              options.onChunk(decodedText)
            }
          }
        }

        // Success: exit retry loop
        return
      } catch (err) {
        // If aborted, stop immediately without retrying
        if (err instanceof DOMException && err.name === 'AbortError') {
          store.addConsoleLog('[System] Streaming request cancelled by user.')
          throw err
        }

        attempt++
        if (attempt > maxRetries) {
          store.addConsoleLog(`[System] API request failed after ${maxRetries} retries. Error: ${(err as Error).message}`)
          store.addToast('Connection failure. Failed to receive AI response from server.', 'error', 5000)
          throw err
        }

        store.addConsoleLog(`[System] Connection error: ${(err as Error).message}. Reconnecting (attempt ${attempt}/${maxRetries})...`)
        store.addToast(`Connection error. Reconnecting (attempt ${attempt}/${maxRetries})...`, 'warning', 3000)

        // Sleep before retrying
        await delay(backoffDelay)
        backoffDelay *= 2 // exponential backoff
      }
    }
  },
}
