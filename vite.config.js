import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the site at /<repo-name>/ — set this when deploying.
// Override via VITE_BASE env if you fork or rename the repo.
const base = process.env.VITE_BASE || '/cy-cards/'

export default defineConfig({
  plugins: [react()],
  base,
})
