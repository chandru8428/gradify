import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Triggering Vite restart for the new .env variables 🚀
export default defineConfig({
    plugins: [react()],

})
