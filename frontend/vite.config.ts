import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

const proxy: any = {}
try {
  // 如果存在开发时环境，调用开发时环境
  proxy['/api'] = require('./dev-config')
} catch (e) {
  /* do nothing */
}

if (proxy['/api'] == null)
  proxy['/api'] = {
    // '/api'是代理标识，用于告诉node，url前面是/api的就是使用代理的
    target: 'http://localhost:9001', //目标地址，一般是指后台服务器地址
    changeOrigin: true, //是否跨域
    rewrite: (path: string) => path.replace(/^\/api/, '')
  }

export default defineConfig({
  // new MonacoWebpackPlugin({ languages: ['javascript', 'typescript'] })
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: { proxy }
})
