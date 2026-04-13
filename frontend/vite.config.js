import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': {},
        global: 'globalThis',
    },
    resolve: {
        alias: {
            buffer: 'buffer',
        },
    },
    build: {
        target: 'es2022',
        minify: 'esbuild',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'stacks': ['@stacks/connect', '@stacks/transactions', '@stacks/network'],
                    'react-vendor': ['react', 'react-dom'],
                },
            },
        },
    },
    server: {
        port: 3000,
        open: true,
    },
});
