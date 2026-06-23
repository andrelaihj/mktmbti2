import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const isStandalone = process.argv.includes('--offline');

// 两种打包模式：
//   npm run build         → Netlify 部署模式（API 走函数）
//   npm run build:offline → 离线单文件模式（无飞书，仅本地存储）
export default defineConfig({
  plugins: [
    react(),
    ...(isStandalone
      ? [
          viteSingleFile({ removeViteModuleLoader: true }),
        ]
      : []),
  ],
  base: isStandalone ? './' : './',
  server: {
    port: 3000,
    open: false,
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    ...(isStandalone
      ? {
          assetsInlineLimit: 100000000,
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
            },
          },
        }
      : {}),
  },
});
