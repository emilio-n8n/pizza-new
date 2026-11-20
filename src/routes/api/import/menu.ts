import { createFileRoute } from '@tanstack/react-router'

import { getSessionPayload } from '#/server/auth.server'

/**
 * Lecture d'une carte photographiée ou dictée.
 *
 * Le navigateur envoie soit une image (base64), soit du texte transcrit par la
 * dictée vocale du système. Le serveur renvoie des lignes brutes normalisées,
 * que le client repasse dans `parseMenuText` : ainsi un seul analyseur décide
 * du format, et le modèle ne peut pas inventer de prix.
 *
 * La clé Gemini ne quitte jamais le serveur.
 */

type Body = { image?: string; text?: string }

const PROMPT = `Tu lis une carte de restaurant (souvent une photo de menu de pizzeria).

Rends UNIQUEMENT les produits, une ligne par produit, au format exact :
<catégorie> | <nom du produit> | <prix en euros>

Règles strictes :
- Prix au format 12,50 ou 8. Jamais de symbole €, jamais de texte après le prix.
- Une ligne par produit réellement lisible. N'invente rien.
- Si un en-tête de section est visible (PIZZAS, BOISSONS, DESSERTS), réutilise-le
  comme catégorie pour les lignes suivantes.
- Si aucun prix n'est lisible pour un produit, écris 0.
- Aucune phrase, aucun commentaire, aucun titre : seulement les lignes.`

// Le modèle doit être un modèle multimodal capable de lire une image.
// Surchargeable par GEMINI_VISION_MODEL une fois vérifié sur le compte.
const MODEL = process.env.GEMINI_VISION_MODEL ?? 'gemini-2.5-flash'

export const Route = createFileRoute('/api/import/menu')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await getSessionPayload()
        if (!session) {
          return Response.json({ ok: false, error: 'Connectez-vous.' }, { status: 401 })
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
          return Response.json(
            { ok: false, error: 'Lecture de carte non configurée.' },
            { status: 503 },
          )
        }

        let body: Body
        try {
          body = (await request.json()) as Body
        } catch {
          return Response.json({ ok: false, error: 'Requête invalide.' }, { status: 400 })
        }

        const parts: unknown[] = [{ text: PROMPT }]

        if (body.image) {
          const match = body.image.match(/^data:(image\/[a-z+]+);base64,(.+)$/i)
          if (!match) {
            return Response.json({ ok: false, error: 'Image illisible.' }, { status: 400 })
          }
          parts.push({
            inline_data: { mime_type: match[1], data: match[2] },
          })
        } else if (body.text?.trim()) {
          // Dictée : le texte transcrit est déjà du texte, pas besoin d'image.
          parts.push({
            text: `Voici une carte dictée à voix haute, la transcription peut contenir des erreurs :\n\n${body.text.trim()}`,
          })
        } else {
          return Response.json(
            { ok: false, error: 'Envoyez une photo ou un texte dicté.' },
            { status: 400 },
          )
        }

        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts }],
                generationConfig: {
                  temperature: 0,
                  maxOutputTokens: 4096,
                  // Les tokens de réflexion comptent dans maxOutputTokens : sans
                  // cette limite, un raisonnement long vide la réponse.
                  thinkingConfig: { thinkingBudget: 0 },
                },
              }),
              signal: AbortSignal.timeout(45_000),
            },
          )

          if (!response.ok) {
            const detail = await response.text()
            console.error('[import/menu]', response.status, detail.slice(0, 300))
            return Response.json(
              { ok: false, error: 'Lecture impossible pour le moment.' },
              { status: 502 },
            )
          }

          const data = (await response.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
          }
          const raw =
            data.candidates?.[0]?.content?.parts
              ?.map((part) => part.text ?? '')
              .join('\n')
              .trim() ?? ''

          const lines = raw
            .split(/\r?\n/)
            .map((line) => line.replace(/^[-*•\d.\s]+/, '').trim())
            .filter((line) => line.includes('|'))
            .map((line) => {
              const [category = '', name = '', price = ''] = line
                .split('|')
                .map((part) => part.trim())
              return { category, name, price }
            })
            .filter((line) => line.name.length > 0)

          if (lines.length === 0) {
            return Response.json({
              ok: false,
              error: 'Rien de lisible. Reprenez une photo plus nette, ou saisissez à la main.',
            })
          }

          return Response.json({ ok: true, lines })
        } catch (error) {
          console.error('[import/menu]', error)
          return Response.json(
            { ok: false, error: 'Lecture impossible pour le moment.' },
            { status: 502 },
          )
        }
      },
    },
  },
})
