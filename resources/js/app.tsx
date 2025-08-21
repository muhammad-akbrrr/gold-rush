import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { Web3Provider } from './contexts/Web3Context';
import { initializeTheme } from './hooks/use-appearance';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(useGSAP);

gsap.defaults({
    duration: 0.5,
    ease: 'expo.inOut',
    overwrite: 'auto',
});

// Initialize Lenis conditionally - avoid on dashboard to prevent memory issues
let lenis: Lenis | null = null;

const initializeLenis = () => {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard')) {
        lenis = new Lenis();
        
        // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            if (lenis) {
                lenis.raf(time * 1000); // Convert time from seconds to milliseconds
            }
        });

        gsap.ticker.lagSmoothing(0);
    }
};

// Cleanup function for Lenis
const cleanupLenis = () => {
    if (lenis) {
        lenis.destroy();
        lenis = null;
    }
};

// Initialize Lenis on load
initializeLenis();

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Add page change handler to manage Lenis and memory cleanup
        if (typeof window !== 'undefined') {
            // Listen for Inertia navigation
            document.addEventListener('inertia:navigate', () => {
                cleanupLenis();
                // Force garbage collection hint (if available)
                if (window.gc) {
                    window.gc();
                }
                // Delay initialization to ensure DOM is ready
                setTimeout(initializeLenis, 100);
            });

            // Cleanup on page unload
            window.addEventListener('beforeunload', () => {
                cleanupLenis();
            });
        }

        root.render(
            <Web3Provider>
                <App {...props} />
            </Web3Provider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
