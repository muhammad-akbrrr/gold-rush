import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    build: {
        rollupOptions: {
            external: [
                // Externalize heavy Mapbox GL features that can be loaded separately
                /mapbox-gl\/dist\/mapbox-gl-dev\.js/,
            ],
            output: {
                manualChunks: {
                    // Separate Mapbox GL into its own chunk with tree-shaking
                    'mapbox-gl': ['mapbox-gl'],
                    // Separate chart libraries
                    'charts': ['recharts'],
                    // Group Web3 dependencies together (preserve for auth)
                    'web3': [
                        '@solana/web3.js',
                        '@solana/wallet-adapter-base',
                        '@solana/wallet-adapter-react',
                        '@solana/wallet-adapter-react-ui',
                        '@solana/wallet-adapter-wallets',
                        '@metamask/multichain-api-client',
                        '@metamask/solana-wallet-standard',
                    ],
                    // Separate GSAP/Lenis for better loading
                    'animations': ['gsap', 'lenis', '@gsap/react'],
                    // Group UI components
                    'ui': [
                        '@radix-ui/react-avatar',
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-tooltip',
                        '@radix-ui/react-select',
                        'lucide-react',
                    ],
                },
            },
            // Aggressive tree-shaking for Mapbox GL
            treeshake: {
                moduleSideEffects: (id) => {
                    // Allow side effects only for core Mapbox GL modules
                    return id.includes('mapbox-gl') && 
                           !id.includes('worker') && 
                           !id.includes('debug') &&
                           !id.includes('dev-tools');
                },
            },
        },
        // Optimize chunk size and enable compression
        chunkSizeWarningLimit: 800,
        minify: 'terser',
        terserOptions: {
            compress: {
                // Remove unused Mapbox GL code
                drop_console: true,
                drop_debugger: true,
                dead_code: true,
                unused: true,
            },
        },
    },
    // Optimize development server for memory usage
    server: {
        hmr: {
            overlay: false,
        },
        // Reduce memory usage in dev
        watch: {
            ignored: ['**/node_modules/**', '**/dist/**', '**/storage/**', '**/vendor/**'],
        },
    },
    // Memory optimizations with Mapbox GL tree-shaking
    optimizeDeps: {
        include: [
            // Pre-bundle heavy dependencies to reduce runtime overhead
            'react',
            'react-dom',
            '@inertiajs/react',
            'mapbox-gl',
        ],
        exclude: [
            // Exclude heavy libraries from pre-bundling to reduce initial memory
            'gsap',
            'lenis',
        ],
    },
    define: {
        // Tree-shake unused Mapbox GL features at compile time
        'process.env.MAPBOX_GL_SUPPORTED': 'true',
        'process.env.NODE_ENV': '"production"',
        // Disable Mapbox GL debugging and development features
        '__MAPBOX_GL_DEV__': false,
        '__MAPBOX_GL_DEBUG__': false,
    },
});
