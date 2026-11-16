import { config } from './config'
import type { ProgramState } from './program'

export type RouteChoice = {
  index: number | null
  confidence: number
  probabilities: number[]
}

export async function routeChoice(
  state: ProgramState,
  conversation: string,
  lastUtterance: string,
): Promise<RouteChoice | null> {
  const options = state.transitions
  if (options.length === 0) return null

  const criteria: Record<string, string> = {}
  options.forEach((option, index) => {
    criteria[`option_${index}`] =
      `${option.intent}. ${option.examples.join(' ; ')}`
  })
  criteria.hors_flux =
    'Le client dit quelque chose qui ne correspond à aucune option du graphe.'

  const response = await fetch(config.jevEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.jevKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.jevModel,
      state: [
        `L'agent vient de demander : ${state.say}`,
        conversation,
        `Le client répond : ${lastUtterance}`,
      ]
        .filter(Boolean)
        .join('\n'),
      questions: {
        next: {
          type: 'choice',
          instructions:
            'Choisis la prochaine étape de la conversation. Si aucune option ne correspond vraiment, choisis hors_flux.',
          criteria,
        },
      },
    }),
  })

  if (!response.ok) {
    console.warn('[jev] échec', response.status, await response.text())
    return null
  }

  const payload = (await response.json()) as {
    answers?: {
      next?: {
        choice?: string
        confidence?: number
        probabilities?: Record<string, number>
      }
    }
  }

  const answer = payload.answers?.next
  if (!answer?.choice) return null

  const probabilities = options.map(
    (_option, index) => answer.probabilities?.[`option_${index}`] ?? 0,
  )

  if (answer.choice === 'hors_flux') {
    return { index: null, confidence: answer.confidence ?? 0, probabilities }
  }

  const index = Number.parseInt(answer.choice.replace('option_', ''), 10)
  if (!Number.isInteger(index) || index < 0 || index >= options.length) {
    return null
  }

  return {
    index,
    confidence: answer.confidence ?? probabilities[index] ?? 0,
    probabilities,
  }
}
