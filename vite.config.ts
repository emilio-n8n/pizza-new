import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Nitro ne sert qu'au build de production (preset Vercel).
// En dev il prend la main sur le serveur Vite et casse l'entrée cliente
// (page servie en SSR mais jamais hydratée : les formulaires ne répondent plus).
const useNitro = Boolean(process.env.NITRO_PRESET)

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    watch: {
      ignored: ['**/.data/**', '**/.openchamber/**', '**/runtime/data/**'],
    },
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    ...(useNitro ? [nitro({ preset: process.env.NITRO_PRESET })] : []),
    viteReact(),
  ],
})

export default config
