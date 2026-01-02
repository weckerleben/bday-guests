import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Para GitHub Pages, usa el nombre de tu repositorio como base path
  // Si tu repo se llama "bday-guests", el base será "/bday-guests/"
  // Si tienes un dominio personalizado o el repo está en la raíz de la organización, usa "/"
  base: process.env.VITE_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/bday-guests/' : '/'),
})
