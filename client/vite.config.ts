import { defineConfig } from 'vite';
import postcssPresetEnv from 'postcss-preset-env';
import viteLitCssPlugin from './vite-lit-css-plugin.js';

export default defineConfig({
  build: { target: 'esnext' },
  plugins: [viteLitCssPlugin()],
  server: { port: 8080, host: true },
  css: {
    postcss: {
      plugins: [postcssPresetEnv({ stage: 2 })]
    }
  }
});
