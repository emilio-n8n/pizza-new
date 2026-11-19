import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
    // Nitro produit la sortie serveur. En local il sert un serveur Node ;
    // avec NITRO_PRESET=vercel il génère .vercel/output pour Vercel.
    nitro({ preset: process.env.NITRO_PRESET }),
    viteReact(),
  ],
})

export default config
