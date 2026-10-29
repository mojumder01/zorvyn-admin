import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' so the build works at https://<user>.github.io/Zorvyn/ and any other path
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
