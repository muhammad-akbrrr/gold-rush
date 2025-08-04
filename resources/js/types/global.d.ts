import type { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;
    interface Window {
        solana?: {
            disconnect?: () => Promise<void>;
            forget?: () => Promise<void>;
            connect?: () => Promise<void>;
            isPhantom?: boolean;
        };
        solflare?: {
            disconnect?: () => Promise<void>;
            connect?: () => Promise<void>;
            isSolflare?: boolean;
        };
        ethereum?: {
            request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            removeAllListeners?: () => void;
            on?: (event: string, callback: (...args: unknown[]) => void) => void;
            off?: (event: string, callback: (...args: unknown[]) => void) => void;
        };
    }
}

export {};
