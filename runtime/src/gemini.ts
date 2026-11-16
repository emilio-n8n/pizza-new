import WebSocket from 'ws'

import { config } from './config'
import { mulawToPcm16, pcm16ToMulaw, pcm16LeToSamples, resample } from './audio'

export type GeminiTool = {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export type ToolCall = {
  id: string
  name: string
  args: Record<string, unknown>
}

export class GeminiLive {
  private ws: WebSocket | null = null
  private ready = false
  private closed = false
  private inputBuf = ''
  private outputBuf = ''

  onAudio?: (mulaw: Buffer) => void
  onInterrupt?: () => void
  onError?: (error: Error) => void
  onReady?: () => void
  onToolCall?: (calls: ToolCall[]) => Promise<Record<string, unknown>[]>
  onTranscript?: (role: 'client' | 'agent', text: string) => void

  constructor(
    private systemPrompt: string,
    private context: string,
    private tools: GeminiTool[] = [],
  ) {}

  connect() {
    if (!config.geminiKey) {
      this.onError?.(new Error('GEMINI_API_KEY absent'))
      return
    }

    const url =
      'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent' +
      `?key=${config.geminiKey}`

    this.ws = new WebSocket(url)

    this.ws.on('open', () => {
      const setup: Record<string, unknown> = {
        model: `models/${config.geminiLiveModel}`,
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: config.ttsVoice },
            },
          },
        },
        systemInstruction: {
          parts: [{ text: `${this.systemPrompt}\n\n${this.context}` }],
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      }

      if (this.tools.length > 0) {
        setup.tools = [
          {
            functionDeclarations: this.tools.map((t) => ({
              name: t.name,
              description: t.description,
              parameters: t.parameters,
            })),
          },
        ]
      }

      this.ws?.send(JSON.stringify({ setup }))
    })

    this.ws.on('message', (raw) => {
      let message: Record<string, unknown>
      try {
        message = JSON.parse(raw.toString())
      } catch {
        return
      }

      if (message.setupComplete) {
        this.ready = true
        this.onReady?.()
        return
      }

      // Handle tool calls
      const toolCall = message.toolCall as
        | { functionCalls?: Array<{ id: string; name: string; args: Record<string, unknown> }> }
        | undefined
      if (toolCall?.functionCalls && toolCall.functionCalls.length > 0) {
        const calls: ToolCall[] = toolCall.functionCalls.map((fc) => ({
          id: fc.id,
          name: fc.name,
          args: fc.args ?? {},
        }))
        void this.handleToolCalls(calls)
        return
      }

      const serverContent = message.serverContent as
        | {
            interrupted?: boolean
            outputTranscription?: { text?: string }
            inputTranscription?: { text?: string }
            modelTurn?: {
              parts?: Array<{
                inlineData?: { data?: string; mimeType?: string }
              }>
            }
          }
        | undefined

      // Les transcriptions arrivent en fragments : on accumule, on publie au tour complet.
      if (serverContent?.inputTranscription?.text) {
        this.inputBuf += serverContent.inputTranscription.text
      }
      if (serverContent?.outputTranscription?.text) {
        this.outputBuf += serverContent.outputTranscription.text
      }

      if (serverContent?.interrupted) {
        this.flushTranscripts()
        this.onInterrupt?.()
      }

      if ((serverContent as { turnComplete?: boolean } | undefined)?.turnComplete) {
        this.flushTranscripts()
      }

      const parts = serverContent?.modelTurn?.parts
      if (!parts) return

      for (const part of parts) {
        const data = part.inlineData?.data
        if (!data) continue
        const pcm24 = pcm16LeToSamples(Buffer.from(data, 'base64'))
        const pcm8 = resample(pcm24, 24000, 8000)
        this.onAudio?.(pcm16ToMulaw(pcm8))
      }
    })

    this.ws.on('error', (error) => {
      this.onError?.(error instanceof Error ? error : new Error(String(error)))
    })

    this.ws.on('close', () => {
      this.ready = false
    })
  }

  private async handleToolCalls(calls: ToolCall[]) {
    if (!this.onToolCall) {
      console.warn('[gemini] tool call received but no handler')
      return
    }
    try {
      const results = await this.onToolCall(calls)
      if (this.ws && this.ws.readyState === 1) {
        this.ws.send(
          JSON.stringify({
            toolResponse: {
              functionResponses: calls.map((c, i) => ({
                id: c.id,
                name: c.name,
                response: results[i] ?? {},
              })),
            },
          }),
        )
      }
    } catch (error) {
      console.error('[gemini] tool call error', error)
    }
  }

  sendAudio(mulaw: Buffer) {
    if (!this.ws || !this.ready || this.closed) return

    const pcm8 = mulawToPcm16(mulaw)
    const pcm16 = resample(pcm8, 8000, 16000)
    const data = Buffer.alloc(pcm16.length * 2)
    for (let i = 0; i < pcm16.length; i += 1) {
      data.writeInt16LE(pcm16[i], i * 2)
    }

    this.ws.send(
      JSON.stringify({
        realtimeInput: {
          audio: {
            mimeType: 'audio/pcm;rate=16000',
            data: data.toString('base64'),
          },
        },
      }),
    )
  }

  private flushTranscripts() {
    const client = this.inputBuf.trim()
    const agent = this.outputBuf.trim()
    this.inputBuf = ''
    this.outputBuf = ''
    if (client) {
      console.log('[gemini] client:', client)
      this.onTranscript?.('client', client)
    }
    if (agent) {
      console.log('[gemini] dit:', agent)
      this.onTranscript?.('agent', agent)
    }
  }

  sendText(text: string) {
    if (!this.ws || !this.ready || this.closed) return
    this.ws.send(
      JSON.stringify({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text }] }],
          turnComplete: true,
        },
      }),
    )
  }

  close() {
    this.closed = true
    this.ready = false
    this.ws?.close()
    this.ws = null
  }
}