import { createServerFn } from '@tanstack/react-start'

type JevOption = {
  id: string
  description: string
}

type JevRequest = {
  state: string
  options: JevOption[]
}

export type JevResult =
  | {
      ok: true
      index: number | null
      confidence: number
      probabilities: number[]
    }
  | { ok: false; reason: string }

const ENDPOINT =
  process.env.JEV_ENDPOINT ??
  'https://opencode.ai/inference/systemone/v1/systemone'

const MODEL = process.env.JEV_MODEL ?? 'jev-1.13-free'

// JEV 1.13 Free est accessible sans clé sur OpenCode Zen avec le jeton "public".
// Une clé Console peut être fournie via JEV_API_KEY.
const KEY = process.env.JEV_API_KEY ?? 'public'

export const routeWithJevFn = createServerFn({ method: 'POST' })
  .validator((data: JevRequest) => data)
  .handler(async ({ data }): Promise<JevResult> => {
    if (data.options.length === 0) {
      return { ok: false, reason: 'no_options' }
    }

    const criteria: Record<string, string> = {}
    data.options.forEach((option, index) => {
      criteria[`option_${index}`] = option.description
    })
    criteria.hors_flux =
      'Le client dit quelque chose qui ne correspond à aucune option du graphe.'

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          state: data.state,
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
        return { ok: false, reason: `http_${response.status}` }
      }

      const payload = (await response.json()) as {
        answers?: {
          next?: {
            type?: string
            choice?: string
            confidence?: number
            probabilities?: Record<string, number>
          }
        }
      }

      const answer = payload.answers?.next
      if (!answer?.choice) {
        return { ok: false, reason: 'missing_choice' }
      }

      const probabilities = data.options.map(
        (_, index) => answer.probabilities?.[`option_${index}`] ?? 0,
      )

      if (answer.choice === 'hors_flux') {
        return {
          ok: true,
          index: null,
          confidence: answer.confidence ?? 0,
          probabilities,
        }
      }

      const index = Number.parseInt(answer.choice.replace('option_', ''), 10)
      if (!Number.isInteger(index) || index < 0 || index >= data.options.length) {
        return { ok: false, reason: 'choice_out_of_range' }
      }

      return {
        ok: true,
        index,
        confidence:
          answer.confidence ?? answer.probabilities?.[`option_${index}`] ?? 0,
        probabilities,
      }
    } catch (error) {
      return {
        ok: false,
        reason: error instanceof Error ? error.message : 'network_error',
      }
    }
  })
