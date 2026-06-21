import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { configs } from 'eslint-plugin-react-refresh'
import theme from '@material-tailwind/react/theme'
import { colors } from '@mui/material'

// https://vite.dev/config/
export default defineConfig({
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      // This will proxy any request starting with '/api'
      '/api': {
        // This is the target: your backend server
        target: 'http://localhost:5000', // <-- Make sure this is your backend's port
        changeOrigin: true, // This is recommended
        secure: false,      // Can be useful if backend is not https
      }
    }
  }
})
