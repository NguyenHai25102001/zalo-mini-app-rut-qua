import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import esbuild from 'esbuild';

// https://vitejs.dev/config/
export default defineConfig({
  root: "./src",
  base: "",
  plugins: [
    react(),
    tsconfigPaths(),
    {
      name: "override-config",
      config: () => ({
        build: {
          target: 'esnext'
        }
      })
    }
  ],
  esbuild: {
    target: 'esnext' // or 'es2020', 'es2019', etc. depending on your requirements
  }
});