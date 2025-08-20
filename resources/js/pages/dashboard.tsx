import MapboxMap from '@/components/dashboard/mapbox-map';
import TickerDrawer from '@/components/dashboard/ticker-drawer';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect } from 'react';

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
                    <MapboxMap className="h-full w-full" mapboxToken={mapboxToken} />
                </div>

                {/* Floating Navigation Bar */}
                <nav className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/20 to-transparent p-4 sm:p-6 lg:p-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Logo */}
                        <div className="flex h-8 w-8 items-center justify-center p-1 sm:h-9 sm:w-9">
                            <img
                                src="https://api.builder.io/api/v1/image/assets/TEMP/c56f45007bdacc9adbdf6e6b6925605428d528e3?width=56"
                                alt="Intelligence Hub Logo"
                                className="h-6 w-6 sm:h-6.5 sm:w-7"
                            />
                        </div>
                        {/* Title */}
                        <h1 className="font-kode-mono text-lg font-bold text-white drop-shadow-lg lg:text-xl">Intelligence Hub</h1>
                    </div>

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
                <TickerDrawer />
            </div>
        </AppLayout>
    );
}
