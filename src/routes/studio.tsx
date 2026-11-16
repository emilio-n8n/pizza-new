import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'

import { BrandMark } from '#/components/brand'
import {
  compileFlow,
  outgoingEdges,
  renderText,
  routeLocally,
  slotValue,
  type RouteResult,
} from '#/studio/engine'
import {
  nodeKindLabel,
  sampleFlow,
  type Flow,
  type FlowEdge,
  type FlowNode,
} from '#/studio/flow'
import { routeWithJevFn } from '#/server/jev'
import { publishFlowFn } from '#/server/publish'

export const Route = createFileRoute('/studio')({
  head: () => ({ meta: [{ title: 'Atelier, PizzaVoice' }] }),
  component: Studio,
})

type ChatMessage = {
  id: string
  role: 'agent' | 'client' | 'system'
  text: string
  meta?: string
}

type WalkResult = {
  currentId: string
  messages: ChatMessage[]
  visitedEdges: string[]
}

function messageId() {
  return globalThis.crypto.randomUUID()
}

function walk(
  flow: Flow,
  nodeId: string,
  slots: Record<string, string>,
  messages: ChatMessage[],
  visitedEdges: string[],
): WalkResult {
  const nextMessages = [...messages]
  const nextEdges = [...visitedEdges]
  let current = nodeId

  for (let guard = 0; guard < 20; guard += 1) {
    const node = flow.nodes.find((item) => item.id === current)
    if (!node) break

    nextMessages.push({
      id: messageId(),
      role: 'agent',
      text: renderText(node.text, slots),
      meta: node.id,
    })

    if (
      node.kind === 'start' ||
      node.kind === 'branch' ||
      node.kind === 'capture' ||
      node.kind === 'handoff' ||
      node.kind === 'end'
    ) {
      if (node.kind === 'handoff') {
        nextMessages.push({
          id: messageId(),
          role: 'system',
          text: "Message d'attente joué. Gemini Live prend le relais pour la suite.",
        })
      }
      return { currentId: current, messages: nextMessages, visitedEdges: nextEdges }
    }

    const out = flow.edges.filter((edge) => edge.from === node.id)
    if (out.length !== 1) {
      return { currentId: current, messages: nextMessages, visitedEdges: nextEdges }
    }

    nextEdges.push(out[0].id)
    current = out[0].to
  }

  return { currentId: current, messages: nextMessages, visitedEdges: nextEdges }
}

type Layout = {
  positions: Map<string, { x: number; y: number }>
  width: number
  height: number
}

const NODE_W = 204
const NODE_H = 88
const GAP_Y = 26

function layoutFlow(flow: Flow): Layout {
  const levels = new Map<string, number>()
  const start = flow.nodes.find((node) => node.kind === 'start') ?? flow.nodes[0]
  levels.set(start.id, 0)
  const queue: string[] = [start.id]
  let guard = 0

  while (queue.length > 0 && guard < 200) {
    guard += 1
    const id = queue.shift()
    if (!id) break
    const level = levels.get(id) ?? 0
    for (const edge of flow.edges.filter((item) => item.from === id)) {
      const candidate = level + 1
      const existing = levels.get(edge.to)
      if (existing === undefined || candidate > existing) {
        levels.set(edge.to, candidate)
        queue.push(edge.to)
      }
    }
  }

  for (const node of flow.nodes) {
    if (!levels.has(node.id)) levels.set(node.id, 0)
  }

  const rows = new Map<number, number>()
  const positions = new Map<string, { x: number; y: number }>()

  for (const node of flow.nodes) {
    const level = levels.get(node.id) ?? 0
    const row = rows.get(level) ?? 0
    rows.set(level, row + 1)
    positions.set(node.id, {
      x: row * (NODE_W + 34) + 24,
      y: level * (NODE_H + GAP_Y + 18) + 24,
    })
  }

  const maxLevel = Math.max(...Array.from(levels.values()), 0)
  const maxRow = Math.max(...Array.from(rows.values()), 0)

  return {
    positions,
    width: (maxRow + 1) * (NODE_W + 34) + 24,
    height: (maxLevel + 1) * (NODE_H + GAP_Y + 18) + 24,
  }
}

const KIND_TONE: Record<FlowNode['kind'], string> = {
  start: 'primary',
  say: 'neutral',
  branch: 'info',
  capture: 'accent',
  action: 'accent',
  handoff: 'warning',
  end: 'success',
}

function Studio() {
  const [flow, setFlow] = useState<Flow>(() => structuredClone(sampleFlow))
  const [selectedId, setSelectedId] = useState<string>('greeting')
  const [tab, setTab] = useState<'sim' | 'program' | 'audio' | 'node'>('sim')
  const [routerMode, setRouterMode] = useState<'local' | 'jev'>('jev')
  const [published, setPublished] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const program = useMemo(() => compileFlow(flow), [flow])
  const layout = useMemo(() => layoutFlow(flow), [flow])

  const [slots, setSlots] = useState<Record<string, string>>({})
  const [input, setInput] = useState('')
  const [trace, setTrace] = useState<string[]>([])
  const [lastRoute, setLastRoute] = useState<RouteResult | null>(null)

  const initial = useMemo(() => walk(flow, 'greeting', {}, [], []), [])
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages)
  const [currentId, setCurrentId] = useState(initial.currentId)
  const [visitedEdges, setVisitedEdges] = useState<string[]>(initial.visitedEdges)

  const scrollRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const canvas = canvasRef.current
    const position = layout.positions.get(currentId)
    if (!canvas || !position) return
    canvas.scrollTo({
      top: Math.max(0, position.y - canvas.clientHeight / 2 + NODE_H / 2),
      behavior: 'smooth',
    })
  }, [currentId, layout])

  const currentNode = flow.nodes.find((node) => node.id === currentId)
  const currentEdges = currentNode ? outgoingEdges(flow, currentNode.id) : []
  const waiting =
    currentNode?.kind === 'branch' ||
    currentNode?.kind === 'start' ||
    currentNode?.kind === 'capture'
  const atEnd = currentNode?.kind === 'end' || currentNode?.kind === 'handoff'

  function focusNode(id: string) {
    const canvas = canvasRef.current
    const position = layout.positions.get(id)
    if (!canvas || !position) return
    canvas.scrollTo({
      top: Math.max(0, position.y - canvas.clientHeight / 2 + NODE_H / 2),
      behavior: 'smooth',
    })
  }

  function reset() {
    const fresh = walk(flow, 'greeting', {}, [], [])
    setMessages(fresh.messages)
    setCurrentId(fresh.currentId)
    setVisitedEdges(fresh.visitedEdges)
    setSlots({})
    setTrace([])
    setLastRoute(null)
    setInput('')
    setTab('sim')
  }

  async function send() {
    const text = input.trim()
    if (!text || !currentNode || busy) return

    const clientMessage: ChatMessage = {
      id: messageId(),
      role: 'client',
      text,
    }
    const nextMessages = [...messages, clientMessage]
    setInput('')

    if (currentNode.kind === 'capture') {
      const nextSlots = { ...slots }
      if (currentNode.slot) nextSlots[currentNode.slot] = text
      setSlots(nextSlots)
      const edge = flow.edges.find((item) => item.from === currentNode.id)
      if (!edge) {
        setMessages(nextMessages)
        return
      }
      const result = walk(
        flow,
        edge.to,
        nextSlots,
        nextMessages,
        [...visitedEdges, edge.id],
      )
      setMessages(result.messages)
      setCurrentId(result.currentId)
      setVisitedEdges(result.visitedEdges)
      setTrace((current) => [...current, `capture:${currentNode.slot ?? 'valeur'}`])
      return
    }

    if (currentEdges.length === 0) {
      setMessages(nextMessages)
      return
    }

    setBusy(true)
    let route: RouteResult

    if (routerMode === 'jev') {
      setTrace((current) => [...current, 'jev:appel'])
      const history = nextMessages
        .slice(-6)
        .map((message) => `${message.role}: ${message.text}`)
        .join('\n')
      const state = `L'agent vient de demander : ${currentNode.text}\n${history}`

      const result = await routeWithJevFn({
        data: {
          state,
          options: currentEdges.map((edge) => ({
            id: edge.id,
            description: `${edge.intent}. ${edge.examples.join(' ; ')}`,
          })),
        },
      })

      if (result.ok) {
        const edge =
          result.index === null ? undefined : currentEdges[result.index]
        route = edge
          ? {
              transitionId: edge.id,
              confidence: result.confidence,
              source: 'jev',
              probabilities: currentEdges.map((item, index) => ({
                id: item.id,
                score: result.probabilities[index] ?? 0,
              })),
            }
          : {
              transitionId: null,
              confidence: result.confidence,
              source: 'none',
              probabilities: currentEdges.map((item, index) => ({
                id: item.id,
                score: result.probabilities[index] ?? 0,
              })),
              reason: 'hors_flux',
            }
        setTrace((current) =>
          [...current, `jev:ok:${result.index === null ? 'hors_flux' : result.index}`],
        )
      } else {
        route = routeLocally(
          program.states[currentNode.id],
          text,
          flow.fallback.threshold,
        )
        setTrace((current) => [...current, `jev:erreur:${result.reason} → local`])
      }
    } else {
      route = routeLocally(
        program.states[currentNode.id],
        text,
        flow.fallback.threshold,
      )
      setTrace((current) => [...current, `local:${route.transitionId ?? 'handoff'}`])
    }

    setLastRoute(route)
    setBusy(false)

    const chosen = currentEdges.find((edge) => edge.id === route.transitionId)

    if (!chosen) {
      const handoffMessage: ChatMessage = {
        id: messageId(),
        role: 'system',
        text: `Aucun choix fiable (${Math.round(route.confidence * 100)} %). Passage à Gemini Live.`,
      }
      const result = walk(
        flow,
        'handoff',
        slots,
        [...nextMessages, handoffMessage],
        visitedEdges,
      )
      setMessages(result.messages)
      setCurrentId(result.currentId)
      setVisitedEdges(result.visitedEdges)
      return
    }

    const nextSlots = { ...slots, ...slotValue(chosen.intent) }
    setSlots(nextSlots)
    const result = walk(
      flow,
      chosen.to,
      nextSlots,
      nextMessages,
      [...visitedEdges, chosen.id],
    )
    setMessages(result.messages)
    setCurrentId(result.currentId)
    setVisitedEdges(result.visitedEdges)
  }

  async function publish() {
    const nextVersion = flow.version + 1
    const nextFlow = { ...flow, version: nextVersion }
    const nextProgram = compileFlow(nextFlow)

    setFlow(nextFlow)
    setPublished(true)
    setToast(`Version ${nextVersion} compilée…`)

    const result = await publishFlowFn({
      data: {
        tenant: 'default',
        name: flow.name,
        program: nextProgram,
      },
    })

    if (result.ok) {
      setToast(
        `Version ${nextVersion} publiée · ${nextProgram.audio.length} messages audio`,
      )
    } else {
      setToast(`Publication refusée : ${result.error}`)
    }
    window.setTimeout(() => setToast(null), 5000)
  }

  function updateNode(id: string, patch: Partial<FlowNode>) {
    setFlow({
      ...flow,
      nodes: flow.nodes.map((node) => (node.id === id ? { ...node, ...patch } : node)),
      version: flow.version,
    })
  }

  function updateEdge(id: string, patch: Partial<FlowEdge>) {
    setFlow({
      ...flow,
      edges: flow.edges.map((edge) => (edge.id === id ? { ...edge, ...patch } : edge)),
    })
  }

  function addEdge(from: string) {
    const target = 'handoff'
    setFlow({
      ...flow,
      edges: [
        ...flow.edges,
        {
          id: `${from}__${target}__${messageId().slice(0, 6)}`,
          from,
          to: target,
          intent: 'Nouvelle intention',
          examples: ['exemple de phrase client'],
        },
      ],
    })
  }

  function removeEdge(id: string) {
    setFlow({ ...flow, edges: flow.edges.filter((edge) => edge.id !== id) })
  }

  const selectedNode = flow.nodes.find((node) => node.id === selectedId)
  const selectedEdges = selectedNode ? outgoingEdges(flow, selectedNode.id) : []
  const totalCharacters = program.audio.reduce((sum, asset) => sum + asset.characters, 0)
  const estimatedSeconds = Math.round(totalCharacters / 14)

  return (
    <div className="studio">
      <header className="studio-top">
        <div className="studio-ident">
          <BrandMark className="brand-mark" />
          <div>
            <span className="studio-name">Atelier</span>
            <span className="studio-sub">Plateforme de dialogues</span>
          </div>
        </div>

        <div className="studio-flow">
          <strong>{flow.name}</strong>
          <span className="studio-meta">
            {published ? `Publié · v${flow.version}` : `Brouillon · v${flow.version}`}
          </span>
        </div>

        <div className="studio-actions">
          <span className={`studio-router ${routerMode === 'jev' ? 'is-jev' : ''}`}>
            <span className="studio-router-dot" />
            Routeur {routerMode === 'jev' ? 'JEV' : 'local'}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            onClick={() => setRouterMode(routerMode === 'jev' ? 'local' : 'jev')}
          >
            Changer
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={() => void publish()}>
            Publier v{flow.version + 1}
          </button>
        </div>
      </header>

      <div className="studio-body">
        <section className="studio-stage" aria-label="Graphe de dialogue">
          <div className="studio-stage-head">
            <span className="mono">
              {flow.nodes.length} nœuds · {flow.edges.length} sorties
            </span>
            <span className="mono">seuil {Math.round(flow.fallback.threshold * 100)} %</span>
          </div>

          <div className="studio-canvas" ref={canvasRef}>
            <div
              className="studio-graph"
              style={{ width: layout.width, height: layout.height }}
            >
              <svg
                className="studio-edges"
                width={layout.width}
                height={layout.height}
                aria-hidden="true"
              >
                {flow.edges.map((edge) => {
                  const from = layout.positions.get(edge.from)
                  const to = layout.positions.get(edge.to)
                  if (!from || !to) return null
                  const x1 = from.x + NODE_W / 2
                  const y1 = from.y + NODE_H
                  const x2 = to.x + NODE_W / 2
                  const y2 = to.y
                  const active = visitedEdges.includes(edge.id)
                  const showLabel = outgoingEdges(flow, edge.from).length > 1
                  return (
                    <g key={edge.id} className={active ? 'is-active' : undefined}>
                      <path
                        d={`M ${x1} ${y1} C ${x1} ${y1 + 42}, ${x2} ${y2 - 42}, ${x2} ${y2}`}
                        className="studio-edge-path"
                      />
                      <circle cx={x2} cy={y2 - 4} r="2.5" className="studio-edge-dot" />
                      {showLabel ? (
                        <text
                          x={x1 * 0.45 + x2 * 0.55}
                          y={y1 * 0.45 + y2 * 0.55}
                          textAnchor="middle"
                          className="studio-edge-label"
                        >
                          {edge.intent.length > 22
                            ? `${edge.intent.slice(0, 21)}…`
                            : edge.intent}
                        </text>
                      ) : null}
                    </g>
                  )
                })}
              </svg>

              {flow.nodes.map((node) => {
                const position = layout.positions.get(node.id)
                if (!position) return null
                const active = node.id === currentId
                return (
                  <button
                    key={node.id}
                    type="button"
                    className={`studio-node tone-${KIND_TONE[node.kind]}${active ? ' is-current' : ''}`}
                    style={{ left: position.x, top: position.y }}
                    onClick={() => {
                      setSelectedId(node.id)
                      setTab('node')
                      focusNode(node.id)
                    }}
                  >
                    <span className="studio-node-kind">{nodeKindLabel[node.kind]}</span>
                    <span className="studio-node-title">{node.title}</span>
                    <span className="studio-node-text">{node.text}</span>
                    {active ? <span className="studio-node-live">En cours</span> : null}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="studio-side">
          <div className="studio-tabs" role="tablist" aria-label="Panneaux de l'atelier">
            {[
              ['sim', 'Simulateur'],
              ['program', 'Programme'],
              ['audio', 'Voix'],
              ['node', 'Nœud'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                className={`studio-tab${tab === value ? ' is-active' : ''}`}
                onClick={() => setTab(value as typeof tab)}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'sim' ? (
            <div className="studio-sim">
              <div className="studio-sim-head">
                <span className="mono">
                  {currentNode ? nodeKindLabel[currentNode.kind] : 'Fin'} · {currentId}
                </span>
                <button className="btn btn-ghost btn-sm" type="button" onClick={reset}>
                  Recommencer
                </button>
              </div>

              <div className="studio-chat" ref={scrollRef}>
                {messages.map((message) => (
                  <div key={message.id} className={`studio-msg is-${message.role}`}>
                    <span className="studio-msg-role">
                      {message.role === 'agent'
                        ? 'Agent'
                        : message.role === 'client'
                          ? 'Client'
                          : 'Système'}
                    </span>
                    <p>{message.text}</p>
                    {message.meta && message.role === 'agent' ? (
                      <span className="studio-msg-meta">{message.meta}</span>
                    ) : null}
                  </div>
                ))}
              </div>

              {lastRoute ? (
                <div className="studio-route">
                  <div className="studio-route-head">
                    <span className={`badge ${lastRoute.source === 'jev' ? 'badge-ready' : 'badge-outline'}`}>
                      {lastRoute.source}
                    </span>
                    <span className="mono">
                      {Math.round(lastRoute.confidence * 100)} % de confiance
                    </span>
                  </div>
                  {lastRoute.probabilities.slice(0, 4).map((item) => {
                    const edge = flow.edges.find((entry) => entry.id === item.id)
                    return (
                      <div className="studio-prob" key={item.id}>
                        <span>{edge?.intent ?? item.id}</span>
                        <span className="studio-prob-bar">
                          <i style={{ width: `${Math.min(100, item.score * 100)}%` }} />
                        </span>
                        <span className="mono">{Math.round(item.score * 100)}</span>
                      </div>
                    )
                  })}
                  {lastRoute.reason ? (
                    <p className="studio-hint">Motif : {lastRoute.reason}</p>
                  ) : null}
                </div>
              ) : null}

              {waiting ? (
                <form
                  className="studio-input"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void send()
                  }}
                >
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={
                      currentNode?.kind === 'capture'
                        ? 'Réponse libre du client…'
                        : 'Ce que dit le client…'
                    }
                    aria-label="Réponse du client"
                  />
                  <button className="btn btn-primary btn-sm" type="submit" disabled={busy}>
                    {busy ? '…' : 'Envoyer'}
                  </button>
                </form>
              ) : atEnd ? (
                <div className="studio-sim-end">
                  <p className="studio-hint">
                    {currentNode?.kind === 'handoff'
                      ? 'La conversation continue dans Gemini Live.'
                      : "L'appel est terminé."}
                  </p>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={reset}>
                    Nouvel appel
                  </button>
                </div>
              ) : null}

              <div className="studio-trace">
                {trace.slice(-4).map((item, index) => (
                  <span key={`${item}-${index}`} className="mono">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {tab === 'program' ? (
            <div className="studio-code">
              <div className="studio-code-head">
                <span className="mono">
                  programme v{program.version} · {Object.keys(program.states).length} états
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(JSON.stringify(program, null, 2))
                    setToast('Programme copié')
                    window.setTimeout(() => setToast(null), 2500)
                  }}
                >
                  Copier
                </button>
              </div>
              <pre>{JSON.stringify(program, null, 2)}</pre>
            </div>
          ) : null}

          {tab === 'audio' ? (
            <div className="studio-audio">
              <div className="studio-audio-stats">
                <div>
                  <span className="mono">Messages</span>
                  <b>{program.audio.length}</b>
                </div>
                <div>
                  <span className="mono">Caractères</span>
                  <b>{totalCharacters}</b>
                </div>
                <div>
                  <span className="mono">Durée estimée</span>
                  <b>
                    {Math.floor(estimatedSeconds / 60)}:
                    {String(estimatedSeconds % 60).padStart(2, '0')}
                  </b>
                </div>
              </div>
              <button className="btn btn-primary btn-block" type="button" disabled>
                Générer les voix (TTS à brancher)
              </button>
              <p className="studio-hint">
                Les messages sont générés une fois par version. Le handoff utilise le message
                d'attente global.
              </p>
              <ul className="studio-audio-list">
                {program.audio.map((asset) => (
                  <li key={asset.key}>
                    <div>
                      <b>{asset.key}</b>
                      <span>{asset.text}</span>
                    </div>
                    <span className="mono">{asset.characters}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {tab === 'node' && selectedNode ? (
            <div className="studio-inspector">
              <div className="studio-inspector-head">
                <span className={`studio-node-kind tone-${KIND_TONE[selectedNode.kind]}`}>
                  {nodeKindLabel[selectedNode.kind]}
                </span>
                <span className="mono">{selectedNode.id}</span>
              </div>
              <div className="field">
                <label htmlFor="node-title">Titre</label>
                <input
                  id="node-title"
                  value={selectedNode.title}
                  onChange={(event) => updateNode(selectedNode.id, { title: event.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="node-text">Message dit par l'agent</label>
                <textarea
                  id="node-text"
                  rows={4}
                  value={selectedNode.text}
                  onChange={(event) => updateNode(selectedNode.id, { text: event.target.value })}
                />
              </div>

              <div className="studio-inspector-edges">
                <p className="studio-inspector-label">Sorties ({selectedEdges.length})</p>
                {selectedEdges.map((edge) => (
                  <div className="studio-edge-card" key={edge.id}>
                    <div className="studio-edge-card-head">
                      <input
                        className="cell-input"
                        value={edge.intent}
                        aria-label="Intention"
                        onChange={(event) =>
                          updateEdge(edge.id, { intent: event.target.value })
                        }
                      />
                      <span className="mono">→ {edge.to}</span>
                      <button
                        className="row-remove"
                        type="button"
                        aria-label="Supprimer la sortie"
                        onClick={() => removeEdge(edge.id)}
                      >
                        ×
                      </button>
                    </div>
                    <textarea
                      className="studio-edge-examples"
                      value={edge.examples.join('\n')}
                      aria-label="Exemples de phrases client"
                      onChange={(event) =>
                        updateEdge(edge.id, {
                          examples: event.target.value
                            .split('\n')
                            .map((line) => line.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </div>
                ))}
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={() => addEdge(selectedNode.id)}
                >
                  Ajouter une sortie
                </button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {toast ? (
        <div className="studio-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
