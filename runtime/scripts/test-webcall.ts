import { readFileSync } from 'node:fs'
import { WebSocket } from 'ws'

import { mulawToPcm16, resample } from '../src/audio'

const file = process.argv[2] ?? '/tmp/opencode/customer.ulaw'
const pcm8 = mulawToPcm16(readFileSync(file))
const pcm16 = resample(pcm8, 8000, 16000)

const ws = new WebSocket('ws://127.0.0.1:8080/web-call')
let audioBytes = 0
let audioMessages = 0
const events: string[] = []
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

ws.on('open', async () => {
  ws.send(JSON.stringify({ type: 'start', tenant: 'default', phone: '+33612345678' }))
  await sleep(5500)

  for (let i = 0; i < pcm16.length; i += 1600) {
    const slice = pcm16.subarray(i, i + 1600)
    const bytes = Buffer.alloc(slice.length * 2)
    for (let j = 0; j < slice.length; j += 1) bytes.writeInt16LE(slice[j], j * 2)
    ws.send(JSON.stringify({ type: 'audio', sampleRate: 16000, data: bytes.toString('base64') }))
    await sleep(100)
  }

  for (let i = 0; i < 12; i += 1) {
    ws.send(JSON.stringify({ type: 'audio', sampleRate: 16000, data: Buffer.alloc(3200, 0).toString('base64') }))
    await sleep(100)
  }

  await sleep(8000)
  console.log('messages audio', audioMessages, 'octets', audioBytes)
  console.log('événements', events)
  ws.send(JSON.stringify({ type: 'stop' }))
  ws.close()
})

ws.on('message', (raw) => {
  const message = JSON.parse(raw.toString())
  if (message.type === 'audio') {
    audioMessages += 1
    audioBytes += Buffer.from(message.data, 'base64').length
  } else if (message.type === 'agent' || message.type === 'client' || message.type === 'handoff') {
    events.push(`${message.type}:${message.text ?? ''}`)
  }
})
ws.on('error', (e) => console.error('ws error', e.message))
