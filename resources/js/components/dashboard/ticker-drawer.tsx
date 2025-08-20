import { Area, AreaChart, ChartContainer, ChartTooltip, ResponsiveContainer, Tooltip, XAxis, YAxis } from '@/components/ui/chart';
import { ArrowUp, ChevronDown, ChevronsUp, Clock, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';

interface TickerData {
    symbol: string;
    price: string;
    change: string;
    percentage: string;
    isPositive: boolean;
    chartData: { time: string; price: number }[];
}

interface NewsItem {
    title: string;
    time: string;
}

const generateChartData = (basePrice: number, isPositive: boolean) => {
    const points = 50;
    const data = [];
    let currentPrice = basePrice;

    for (let i = 0; i < points; i++) {
        const variation = (Math.random() - 0.5) * 0.02;
        const trend = isPositive ? 0.001 : -0.001;
        currentPrice += currentPrice * (variation + trend);

        data.push({
            time: `${9 + Math.floor(i / 6)}:${String((i % 6) * 10).padStart(2, '0')}`,
            price: Math.round(currentPrice * 100) / 100,
        });
    }

    return data;
};

const tickerAssets: TickerData[] = [
    {
        symbol: 'GOLD',
        price: '3,643.7 USD',
        change: '+7.05',
        percentage: '+0.21%',
        isPositive: true,
        chartData: generateChartData(3643.7, true),
    },
    {
        symbol: 'GOLDTOKEN',
        price: '1.21 USD',
        change: '+0.05',
        percentage: '+0.21%',
        isPositive: true,
        chartData: generateChartData(1.21, true),
    },
];

const newsItems: NewsItem[] = [
    {
        title: 'Gold Holds Near 2-Week High',
        time: '15 mins ago',
    },
    {
        title: 'Gold Holds Longest Winning Streak since February on Economy Woes',
        time: '23 mins ago',
    },
    {
        title: 'Gold Futures Remain in Uptrend, Chart Shows - Market Talk',
        time: '34 mins ago',
    },
    {
        title: 'Gold price today, Tuesday, August 5, 2025: Gold opens near record high',
        time: '45 mins ago',
    },
    {
        title: 'Gold price today, Tuesday, August 5, 2025: Gold opens near record high',
        time: '1 hour ago',
    },
    {
        title: 'Gold price today, Tuesday, August 5, 2025: Gold opens near record high',
        time: '2 hours ago',
    },
    {
        title: 'Gold maintains bullish momentum amid market uncertainty',
        time: '3 hours ago',
    },
    {
        title: 'Central bank gold purchases continue to support prices',
        time: '4 hours ago',
    },
];

const timeFrames = ['1D', '7D', '1M', '1Y', 'All'];

const TickerDrawer: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeAsset, setActiveAsset] = useState(0);
    const [activeTimeFrame, setActiveTimeFrame] = useState('1D');

    const toggleDrawer = () => {
        setIsExpanded(!isExpanded);
    };

    const currentAsset = tickerAssets[activeAsset];

    return (
        <>
            {/* Expanded Drawer Content - Full Width */}
            <div
                className={`from-hub-gray-700 to-hub-gray-950 border-hub-gray-850 fixed right-0 left-0 z-40 rounded-tl-3xl rounded-tr-3xl border-t bg-gradient-to-b backdrop-blur-sm transition-all duration-300 ease-in-out ${isExpanded ? 'visible opacity-100' : 'pointer-events-none invisible translate-y-full opacity-0'} `}
                style={{
                    maxHeight: 'none',
                    bottom: '0',
                }}
            >
                {/* Drawer Header */}
                <div className="border-hub-gray-850 flex items-center justify-between border-b p-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-hub-gray-500 font-kode-mono text-sm font-bold">Live Price</h3>
                        {/* Asset Tabs */}
                        <div className="flex items-center gap-2">
                            {tickerAssets.map((ticker, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveAsset(index)}
                                    className={`font-lekton rounded px-3 py-1 text-sm font-bold transition-colors ${
                                        activeAsset === index ? 'bg-hub-gray-850 text-hub-gray-500' : 'text-hub-gray-500/70 hover:bg-hub-gray-850/50'
                                    }`}
                                >
                                    {ticker.symbol}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={toggleDrawer} className="hover:bg-hub-gray-850 rounded p-1 transition-colors">
                        <ChevronDown className="text-hub-gray-500 h-4 w-4" />
                    </button>
                </div>

                {/* Main Content - 2 Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left Side - Chart Section */}
                    <div className="border-hub-gray-850 border-r p-4">
                        <div className="bg-hub-gray-950/50 border-hub-gray-850/50 flex h-auto flex-col rounded-lg border p-4">
                            {/* Chart Header */}
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-hub-gray-500 font-lekton text-2xl font-bold">{currentAsset.symbol}</span>
                                    <div className="flex items-center gap-1">
                                        {currentAsset.isPositive ? (
                                            <ArrowUp className="text-hub-green-600 fill-hub-green-600 h-5 w-5" />
                                        ) : (
                                            <ArrowUp className="h-5 w-5 rotate-180 fill-red-500 text-red-500" />
                                        )}
                                        <span className={`font-lekton text-lg ${currentAsset.isPositive ? 'text-hub-green-600' : 'text-red-400'}`}>
                                            {currentAsset.percentage}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="text-hub-gray-500 h-5 w-5" />
                                </div>
                            </div>

                            {/* Price Display */}
                            <div className="mb-6">
                                <span className="text-hub-gray-500 font-kode-mono text-3xl font-bold">{currentAsset.price}</span>
                                <div className="mt-2 flex items-center gap-3">
                                    <span className={`font-lekton text-lg ${currentAsset.isPositive ? 'text-hub-green-600' : 'text-red-400'}`}>
                                        {currentAsset.change}
                                    </span>
                                    <span className={`font-lekton text-lg ${currentAsset.isPositive ? 'text-hub-green-600' : 'text-red-400'}`}>
                                        {currentAsset.percentage}
                                    </span>
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="mb-4" style={{ height: '300px' }}>
                                <ChartContainer className="h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={currentAsset.chartData}>
                                            <defs>
                                                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={currentAsset.isPositive ? '#29A03F' : '#ef4444'} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={currentAsset.isPositive ? '#29A03F' : '#ef4444'} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis
                                                dataKey="time"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: '#737373' }}
                                                interval={Math.floor(currentAsset.chartData.length / 6)}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: '#737373' }}
                                                domain={['dataMin - 5', 'dataMax + 5']}
                                            />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="price"
                                                stroke={currentAsset.isPositive ? '#29A03F' : '#ef4444'}
                                                strokeWidth={2}
                                                fill="url(#gradient)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>

                            {/* Time Frame Buttons */}
                            <div className="flex items-center gap-2">
                                {timeFrames.map((timeFrame) => (
                                    <button
                                        key={timeFrame}
                                        onClick={() => setActiveTimeFrame(timeFrame)}
                                        className={`font-lekton rounded px-3 py-1 text-sm transition-colors ${
                                            activeTimeFrame === timeFrame ? 'bg-hub-green-600 text-white' : 'text-hub-gray-500 hover:bg-hub-gray-850'
                                        }`}
                                    >
                                        {timeFrame}
                                    </button>
                                ))}
                                <span className="text-hub-gray-500 font-lekton ml-3 text-sm">All time</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - News Feed */}
                    <div>
                        <div className="flex h-full flex-col p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-hub-gray-500 font-kode-mono text-sm font-bold">News</h3>
                                <div className="flex items-center gap-2">
                                    <button className="font-lekton bg-hub-gray-850 text-hub-gray-500 rounded px-2 py-1 text-xs">Top</button>
                                    <button className="font-lekton text-hub-gray-500 hover:bg-hub-gray-850 rounded px-2 py-1 text-xs">Latest</button>
                                </div>
                            </div>

                            {/* News Items - Hidden Scrollbar */}
                            <div className="border-hub-gray-850/50 relative flex-1 border-b">
                                <div
                                    className="scrollbar-hide absolute top-0 right-0 bottom-0 left-0 space-y-3 overflow-y-auto"
                                    style={{
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                    }}
                                >
                                    {newsItems.map((news, index) => (
                                        <div
                                            key={index}
                                            className="bg-hub-gray-950/50 border-hub-gray-850/50 hover:bg-hub-gray-850/30 cursor-pointer rounded-lg border p-3 transition-colors"
                                        >
                                            <h4 className="text-hub-gray-500 font-lekton mb-2 text-sm leading-relaxed">{news.title}</h4>
                                            <div className="text-hub-gray-500/70 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span className="font-lekton text-xs">{news.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collapsed Ticker Bar - Centered and Compact */}
            <div className="fixed right-0 bottom-0 left-0 z-30 flex justify-center">
                <div
                    className={`from-hub-gray-700 to-hub-gray-950 border-hub-gray-850 hover:bg-opacity-80 mx-auto flex h-8 max-w-fit cursor-pointer items-center gap-2 rounded-tl-3xl rounded-tr-3xl border bg-gradient-to-b px-4 backdrop-blur-sm transition-all duration-200 lg:gap-4 lg:px-6`}
                    onClick={toggleDrawer}
                >
                    <div className="flex flex-nowrap items-center gap-2 lg:gap-4">
                        {/* GOLD */}
                        <div className="flex flex-nowrap items-center gap-1 lg:gap-2">
                            <div className="flex items-center gap-1 lg:gap-2">
                                <span className="text-hub-gray-500 font-lekton text-xs font-bold whitespace-nowrap lg:text-sm">GOLD</span>
                                <span className="text-hub-gray-500 font-lekton text-xs font-bold whitespace-nowrap lg:text-sm">3,643.7 USD</span>
                            </div>
                            <div className="flex items-center gap-0.5 lg:gap-1">
                                <ArrowUp className="text-hub-green-600 fill-hub-green-600 h-3 w-3 lg:h-4 lg:w-4" />
                                <span className="text-hub-green-600 font-lekton text-xs whitespace-nowrap lg:text-sm">+0.21%</span>
                            </div>
                        </div>

                        <ChevronsUp className="h-4 w-4 flex-shrink-0 text-gray-400 lg:h-5 lg:w-5" />

                        {/* GOLDTOKEN */}
                        <div className="flex flex-nowrap items-center gap-1 lg:gap-2">
                            <div className="flex items-center gap-1 lg:gap-2">
                                <span className="text-hub-gray-500 font-lekton text-xs font-bold whitespace-nowrap lg:text-sm">GOLDTOKEN</span>
                                <span className="text-hub-gray-500 font-lekton text-xs font-bold whitespace-nowrap lg:text-sm">1.21 USD</span>
                            </div>
                            <div className="flex items-center gap-0.5 lg:gap-1">
                                <ArrowUp className="text-hub-green-600 fill-hub-green-600 h-3 w-3 lg:h-4 lg:w-4" />
                                <span className="text-hub-green-600 font-lekton text-xs whitespace-nowrap lg:text-sm">+0.21%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TickerDrawer;
