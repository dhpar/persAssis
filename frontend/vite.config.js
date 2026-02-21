import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => {
  return {  
    server:{
      host: '0.0.0.0', // Listen on all network interfaces
      port: 5173, // Or whatever port you are using
      cors: {
        origin: true, // Allow all origins during development, or specify a specific origin like 'http://localhost'
        credentials: true,
      },
      // Required for HMR to work in some Docker/WSL environments
      hmr: {
        host: 'localhost', 
      },
    },
    plugins: [
      tailwindcss(),
      react(),
    ],
  };
});
