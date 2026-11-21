import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';

// Autorise le JSX dans les fichiers .js de src/
const jsxDansJs = {
  name: 'jsx-dans-js',
  enforce: 'pre',
  async transform(code, id) {
    if (!/\/src\/.*\.js$/.test(id.replace(/\\/g, '/'))) return null;
    return transformWithOxc(code, id, { lang: 'jsx' });
  },
};

export default defineConfig({
  plugins: [jsxDansJs, react()],
  optimizeDeps: {
    rolldownOptions: { moduleTypes: { '.js': 'jsx' } },
  },
});