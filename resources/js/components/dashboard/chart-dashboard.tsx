import * as React from 'react';
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

import { cn } from '@/lib/utils';

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('h-full w-full', className)} {...props} />
));
ChartContainer.displayName = 'ChartContainer';

interface ChartTooltipProps {
    active?: boolean;
    payload?: TooltipProps<ValueType, NameType>['payload'];
    label?: string;
}

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-hub-gray-950 border-hub-gray-850 rounded-lg border p-2 shadow-md">
                <div className="grid gap-2">
                    <div className="flex flex-col">
                        <span className="text-hub-gray-500 font-lekton text-xs">{label}</span>
                        <span className="text-hub-gray-500 font-kode-mono font-bold">${payload[0].value?.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export { Area, AreaChart, ChartContainer, ChartTooltip, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis };
