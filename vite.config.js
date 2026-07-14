import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages (https://kata-n.github.io/chord-lab/) 用のパス。開発時はルートのまま
  base: command === 'build' ? '/chord-lab/' : '/',
}));
