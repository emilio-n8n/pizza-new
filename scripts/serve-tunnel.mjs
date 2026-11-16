import { spawn } from 'node:child_process'
import { createServer, request as httpRequest } from 'node:http'
import { connect } from 'node:net'
import { resolve } from 'node:path'

/**
 * Lance l'app (port 4001) et le runtime (port 8080), puis expose UN SEUL port
 * public (8088) qui route :
 *   - /phone-ws, /web-call, /media  -> runtime (upgrade WebSocket)
 *   - tout le reste                 -> app
 *
 * Sert de cible à un tunnel Cloudflare pour tester à distance sans Docker.
 */

const APP_PORT = Number(process.env.APP_PORT ?? 4001)
const RUNTIME_PORT = Number(process.env.RUNTIME_PORT ?? 8080)
const PUBLIC_PORT = Number(process.env.PUBLIC_PORT ?? 8088)
const ROOT = resolve(import.meta.dirname, '..')

const WS_PATHS = ['/phone-ws', '/web-call', '/media']
const RUNTIME_PATHS = [...WS_PATHS, '/health', '/twilio']

const children = []

function launch(name, port, cwd, script) {
  const child = spawn('npm', ['run', script, '--', '--host', '127.0.0.1', '--port', String(port)], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  })
  child.stdout?.on('data', (b) => process.stdout.write(`[${name}] ${b}`))
  child.stderr?.on('data', (b) => process.stderr.write(`[${name}] ${b}`))
  child.on('exit', (code) => console.log(`[${name}] terminé code=${code}`))
  children.push(child)
  return child
}

function waitForPort(port, deadlineMs = 90000) {
  const start = Date.now()
  return new Promise((resolvePromise, reject) => {
    const attempt = () => {
      const socket = connect({ host: '127.0.0.1', port }, () => {
        socket.destroy()
        resolvePromise()
      })
      socket.on('error', () => {
        socket.destroy()
        if (Date.now() - start > deadlineMs) {
          reject(new Error(`port ${port} jamais prêt`))
          return
        }
        setTimeout(attempt, 500)
      })
    }
    attempt()
  })
}

let server

async function main() {
  launch('app', APP_PORT, ROOT, 'dev')
  launch('runtime', RUNTIME_PORT, resolve(ROOT, 'runtime'), 'dev')

  await Promise.all([waitForPort(APP_PORT), waitForPort(RUNTIME_PORT)])
  console.log(`[proxy] app=${APP_PORT} runtime=${RUNTIME_PORT}`)

  server = createServer((req, res) => {
    const isWs = RUNTIME_PATHS.some((p) => (req.url ?? '').startsWith(p))
    const target = { host: '127.0.0.1', port: isWs ? RUNTIME_PORT : APP_PORT }

    const upstream = httpRequest(
      {
        host: target.host,
        port: target.port,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: `127.0.0.1:${target.port}` },
      },
      (up) => {
        res.writeHead(up.statusCode ?? 502, up.headers)
        up.pipe(res)
      },
    )

    upstream.on('error', (error) => {
      res.writeHead(502, { 'content-type': 'text/plain' })
      res.end(`proxy error: ${error.message}`)
    })

    req.pipe(upstream)
  })

  server.on('upgrade', (req, socket, head) => {
    const goesToRuntime = WS_PATHS.some((p) => (req.url ?? '').startsWith(p))
    const port = goesToRuntime ? RUNTIME_PORT : APP_PORT
    const upstream = connect({ host: '127.0.0.1', port }, () => {
      const headers = Object.entries(req.headers)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('\r\n')
      upstream.write(`${req.method} ${req.url} HTTP/1.1\r\n${headers}\r\n\r\n`)
      if (head.length > 0) upstream.write(head)
      upstream.pipe(socket)
      socket.pipe(upstream)
    })
    upstream.on('error', () => socket.destroy())
    socket.on('error', () => upstream.destroy())
  })

  server.listen(PUBLIC_PORT, '127.0.0.1', () => {
    console.log(`[proxy] prêt sur http://127.0.0.1:${PUBLIC_PORT}`)
  })
}

function shutdown() {
  for (const child of children) child.kill('SIGTERM')
  server?.close()
  setTimeout(() => process.exit(0), 800)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

main().catch((error) => {
  console.error('[proxy] échec', error)
  shutdown()
})
