// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel(),
  integrations: [react()],
  vite: {
    // @ts-ignore - Tailwind Vite plugin type mismatch (known issue)
    plugins: [tailwindcss()],
  },
});
