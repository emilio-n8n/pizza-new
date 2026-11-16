import WebSocket from 'ws'

const url = process.env.WS_URL ?? 'ws://127.0.0.1:8080/web-call'
const sequence = (
  process.env.QUESTION ??
  "Bonjour, qu'est-ce que vous avez comme pizzas, et à quel prix ?"
).split('|')

const ws = new WebSocket(url)
const t0 = Date.now()
const log = (...a: unknown[]) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a)

ws.on('open', () => {
  log('connecté', url)
  ws.send(JSON.stringify({ type: 'start', tenant: 'default', phone: '0600000000' }))
  sequence.forEach((q, i) => {
    setTimeout(() => {
      log('envoi :', q)
      ws.send(JSON.stringify({ type: 'text', text: q }))
    }, 9000 + i * 9000)
  })
})

ws.on('message', (raw) => {
  let msg: any
  try {
    msg = JSON.parse(raw.toString())
  } catch {
    return
  }
  if (msg.type === 'audio') {
    log('audio', msg.data.length, 'octets b64')
    return
  }
  log('event', JSON.stringify(msg).slice(0, 400))
})

ws.on('error', (e) => console.error('erreur ws', e.message))

setTimeout(() => {
  log('fin du test')
  try {
    ws.send(JSON.stringify({ type: 'stop' }))
  } catch {}
  setTimeout(() => process.exit(0), 1500)
}, 35000)
