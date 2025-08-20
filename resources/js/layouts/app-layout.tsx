import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-screen bg-background">
            {/* Page Content */}
            <main className="flex-1">{children}</main>
        </div>
    );
}
