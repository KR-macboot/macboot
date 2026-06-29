import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` is set to './' so the built site works from any sub-path
// (e.g. GitHub Pages project pages served under /macboot/).
export default defineConfig({
  base: './',
  plugins: [react()],
})
