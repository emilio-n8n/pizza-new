import WebSocket from 'ws'

import { config } from '../src/config'

const model = process.argv[2] ?? config.geminiLiveModel
const url =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent' +
  `?key=${config.geminiKey}`

const ws = new WebSocket(url)
let audioBytes = 0
let done = false

const timer = setTimeout(() => {
  if (!done) {
    console.log('timeout · audio reçu:', audioBytes)
    ws.close()
    process.exit(0)
  }
}, 20000)

ws.on('open', () => {
  console.log('connecté, modèle', model)
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
          parts: [{ text: 'Tu es Sophie, une serveuse de pizzeria. Réponds en français.' }],
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    }),
  )
})

ws.on('message', (raw) => {
  const message = JSON.parse(raw.toString())
  if (message.setupComplete) {
    console.log('setupComplete')
    ws.send(
      JSON.stringify({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text: 'Bonjour, dis-moi bonjour.' }] }],
          turnComplete: true,
        },
      }),
    )
    return
  }

  if (message.error) {
    console.log('erreur', JSON.stringify(message.error).slice(0, 400))
    done = true
    clearTimeout(timer)
    ws.close()
    return
  }

  const parts = message.serverContent?.modelTurn?.parts ?? []
  for (const part of parts) {
    if (part.inlineData?.data) {
      audioBytes += Buffer.from(part.inlineData.data, 'base64').length
      console.log('audio', part.inlineData.mimeType, audioBytes)
    }
    if (part.text) console.log('texte', part.text.slice(0, 120))
  }
  if (message.serverContent?.turnComplete && audioBytes > 0) {
    console.log('tour terminé · audio reçu:', audioBytes)
    done = true
    clearTimeout(timer)
    ws.close()
    setTimeout(() => process.exit(0), 300)
  }
})

ws.on('error', (error) => console.log('ws erreur', error.message))
