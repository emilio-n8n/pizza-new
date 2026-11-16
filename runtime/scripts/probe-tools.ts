import 'dotenv/config'
import WebSocket from 'ws'

const key = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_LIVE_MODEL ?? 'gemini-3.8-live'
if (!key) {
  console.error('GEMINI_API_KEY absent')
  process.exit(1)
}

const url =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent' +
  `?key=${key}`

const ws = new WebSocket(url)
let toolCalled = false
const t0 = Date.now()

ws.on('open', () => {
  ws.send(
    JSON.stringify({
      setup: {
        model: `models/${model}`,
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
        systemInstruction: {
          parts: [
            {
              text: "Tu es Sophie, assistante d'une pizzeria. Utilise l'outil get_menu pour connaître la carte. Ne devine jamais un prix.",
            },
          ],
        },
        tools: [
          {
            functionDeclarations: [
              {
                name: 'get_menu',
                description: 'Récupère la carte avec les prix.',
                parameters: { type: 'object', properties: {} },
              },
            ],
          },
        ],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    }),
  )
})

ws.on('message', (raw) => {
  const msg = JSON.parse(raw.toString())
  if (msg.setupComplete) {
    console.log('[probe] setup OK en', Date.now() - t0, 'ms — envoi du tour texte')
    ws.send(
      JSON.stringify({
        clientContent: {
          turns: [
            {
              role: 'user',
              parts: [{ text: "Bonjour, qu'est-ce que vous avez comme pizzas et à quel prix ?" }],
            },
          ],
          turnComplete: true,
        },
      }),
    )
    return
  }
  if (msg.toolCall) {
    toolCalled = true
    console.log('[probe] TOOL CALL REÇU:', JSON.stringify(msg.toolCall))
    ws.send(
      JSON.stringify({
        toolResponse: {
          functionResponses: msg.toolCall.functionCalls.map((fc: { id: string; name: string }) => ({
            id: fc.id,
            name: fc.name,
            response: { menu: [{ name: 'Regina', priceEuros: '13.50' }] },
          })),
        },
      }),
    )
    return
  }
  if (msg.serverContent?.outputTranscription?.text) {
    process.stdout.write(`[dit] ${msg.serverContent.outputTranscription.text}`)
  }
  if (msg.serverContent?.turnComplete) {
    console.log('\n[probe] tour terminé, toolCalled =', toolCalled, 'durée', Date.now() - t0, 'ms')
    ws.close()
    setTimeout(() => process.exit(toolCalled ? 0 : 2), 200)
  }
})

ws.on('error', (e) => {
  console.error('[probe] erreur', e.message)
  process.exit(1)
})

setTimeout(() => {
  console.log('[probe] timeout, toolCalled =', toolCalled)
  ws.close()
  process.exit(toolCalled ? 0 : 2)
}, 25000)
