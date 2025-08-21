import { BrandLogo } from '@/components/brand-logo';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { lazy, Suspense, useEffect } from 'react';

// Lazy load heavy dashboard components to reduce initial bundle size
const MapboxMap = lazy(() => import('@/components/dashboard/mapbox-map'));
const TickerDrawer = lazy(() => import('@/components/dashboard/ticker-drawer'));

interface DashboardProps {
    mapboxToken: string | null;
}

export default function Dashboard({ mapboxToken }: DashboardProps) {
    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (!theme) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="from-hub-gray-900 to-hub-gray-950 text-hub-gray-500 relative h-full w-full overflow-hidden bg-gradient-to-b">
                {/* Fullscreen Interactive Map */}
                <div className="absolute inset-0">
                    <Suspense
                        fallback={
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950">
                                <div className="flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-gray-300"></div>
                                    <p className="text-gray-400">Loading map</p>
                                </div>
                            </div>
                        }
                    >
                        <MapboxMap className="h-full w-full" mapboxToken={mapboxToken} />
                    </Suspense>
                </div>

                {/* Floating Navigation Bar */}
                <nav className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/20 to-transparent p-4 sm:p-6 lg:p-4">
                    <Link href="/" className="flex items-center gap-2 sm:gap-3">
                        {/* Logo */}
                        <div className="flex h-8 w-8 items-center justify-center p-1 sm:h-9 sm:w-9">
                            <BrandLogo className="h-6 w-6 sm:h-6.5 sm:w-7" />
                        </div>
                        {/* Title */}
                        <h1 className="font-kode-mono text-lg font-bold text-white drop-shadow-lg lg:text-xl">Intelligence Hub</h1>
                    </Link>

                    {/* User Controls */}
                    <div className="flex items-center gap-0">
                        <button className="border-hub-gray-850 from-hub-gray-700 to-hub-gray-950 flex h-8 w-8 items-center justify-center rounded-full border bg-gradient-to-b backdrop-blur-sm sm:h-10 sm:w-10">
                            <div className="h-3 w-3 rounded-sm bg-white sm:h-3.5 sm:w-3.5"></div>
                        </button>
                        <button className="hidden items-center gap-2 rounded-lg px-2 py-2 sm:flex sm:px-4">
                            <span className="text-hub-gray-500 font-lekton text-sm">Mini Trueno</span>
                            <ChevronDown className="text-hub-gray-500 h-4 w-4" />
                        </button>
                    </div>
                </nav>

                {/* Bottom Ticker Drawer */}
                <Suspense
                    fallback={
                        <div className="fixed right-0 bottom-0 left-0 z-30 flex justify-center">
                            <div className="mx-auto flex h-8 max-w-fit items-center gap-4 rounded-tl-3xl rounded-tr-3xl border border-gray-600 bg-gradient-to-b from-gray-700 to-gray-900 px-6 backdrop-blur-sm">
                                <div className="h-3 w-3 animate-pulse rounded-full bg-gray-400"></div>
                                <span className="text-sm text-gray-400">Loading ticker...</span>
                            </div>
                        </div>
                    }
                >
                    <TickerDrawer />
                </Suspense>
            </div>
        </AppLayout>
    );
}
