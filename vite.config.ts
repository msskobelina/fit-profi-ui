import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    server: {
        port: 5174,
        proxy: {
            '/api/v1': {
                target: 'http://127.0.0.1:8085',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})
