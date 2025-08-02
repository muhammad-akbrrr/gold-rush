import { cn } from "@/lib/utils";
import React from "react";

interface GridProps {
    className?: string;
    variant?: string;
    spacing?: number;
}

const GridComponent = ({ className, variant }: GridProps) => {
    const size = 1282;
    const stroke = "var(--border)"

    const createVerticalLines = (spacing: number) => {
        const lines = [];
        for (let x = 1; x <= size; x += spacing) {
            lines.push(<line key={`v-${x}`} x1={x} y1="1" x2={x} y2={size} stroke={stroke} />);
        }
        return lines;
    };

    const createHorizontalLines = (spacing: number) => {
        const lines = [];
        for (let y = 1; y <= size; y += spacing) {
            lines.push(<line key={`h-${y}`} x1="1" y1={y} x2={size} y2={y} stroke={stroke} />);
        }
        return lines;
    };

    // Pre-generate all spacing variants once
    const spacings = {
        small: 50,
        medium: 67.5,
        large: 100,
    };

    const verticals = {
        small: createVerticalLines(spacings.small),
        medium: createVerticalLines(spacings.medium),
        large: createVerticalLines(spacings.large),
    };

    const horizontals = {
        small: createHorizontalLines(spacings.small),
        medium: createHorizontalLines(spacings.medium),
        large: createHorizontalLines(spacings.large),
    };


    if (variant === "small") {
        return (
            <svg className={cn("opacity-10", className)} width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
                {verticals.small}
                {horizontals.small}
            </svg>
        )
    } else if (variant === "sparse") {
        return (
            <svg className={cn("", className)} width="960" height="856" viewBox="0 0 960 856" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M160 -79V887.972" stroke="#BEC1C8" />
                <path d="M799 -79V887.972" stroke="#BEC1C8" />
                <path d="M0 27.9858H960" stroke="#BEC1C8" />
                <path d="M0 403.986H960" stroke="#BEC1C8" />
                <path d="M0 304H960" stroke="#BEC1C8" />
                <path d="M0 503.986H960" stroke="#BEC1C8" />
                <path d="M0 780.986H960" stroke="#BEC1C8" />
            </svg>

        )
    } else {
        return (
            <svg className={cn("", className)} width="1920" height="764" viewBox="0 0 1920 764" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="mask0_437_5" style={{maskType: "alpha"}} maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="764">
                    <rect width="1920" height="764" fill="url(#paint0_linear_437_5)" />
                </mask>
                <g mask="url(#mask0_437_5)">
                    <path d="M175.762 351L-1236.33 1389.07" stroke="#BEC1C8" />
                    <path d="M399.834 351L-540.558 1389.07" stroke="#BEC1C8" />
                    <path d="M623.922 351L83.5546 1389.07" stroke="#BEC1C8" />
                    <path d="M847.996 351L671.56 1389.07" stroke="#BEC1C8" />
                    <path d="M1072.08 351L1248.51 1389.07" stroke="#BEC1C8" />
                    <path d="M1296.12 351L1836.49 1389.07" stroke="#BEC1C8" />
                    <path d="M1520.19 351L2460.58 1389.07" stroke="#BEC1C8" />
                    <path d="M1744.27 351L3156.36 1389.07" stroke="#BEC1C8" />
                    <path d="M-51.3926 352.594H1971.46" stroke="#BEC1C8" />
                    <path d="M-55.5137 354.703H1975.57" stroke="#BEC1C8" />
                    <path d="M-58.8398 356.422H1978.89" stroke="#BEC1C8" />
                    <path d="M-63.3281 358.719H1983.37" stroke="#BEC1C8" />
                    <path d="M-69.2598 361.781H1989.32" stroke="#BEC1C8" />
                    <path d="M-76.9961 365.766H1997.07" stroke="#BEC1C8" />
                    <path d="M-86.9395 370.875H2007" stroke="#BEC1C8" />
                    <path d="M-99.5273 377.375H2019.59" stroke="#BEC1C8" />
                    <path d="M-115.299 385.484H2035.35" stroke="#BEC1C8" />
                    <path d="M-134.844 395.531H2054.87" stroke="#BEC1C8" />
                    <path d="M-158.787 407.875H2078.85" stroke="#BEC1C8" />
                    <path d="M-187.938 422.875H2107.98" stroke="#BEC1C8" />
                    <path d="M-223.072 440.953H2143.13" stroke="#BEC1C8" />
                    <path d="M-265.154 462.609H2185.2" stroke="#BEC1C8" />
                    <path d="M-315.18 488.359H2235.22" stroke="#BEC1C8" />
                    <path d="M-374.262 518.781H2294.32" stroke="#BEC1C8" />
                    <path d="M-443.662 554.5H2363.69" stroke="#BEC1C8" />
                    <path d="M-524.686 596.203H2444.74" stroke="#BEC1C8" />
                    <path d="M-618.844 644.672H2538.87" stroke="#BEC1C8" />
                    <path d="M-727.688 700.703H2647.73" stroke="#BEC1C8" />
                </g>
                <defs>
                    <linearGradient id="paint0_linear_437_5" x1="960" y1="369.224" x2="960" y2="764" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#D9D9D9" stop-opacity="0" />
                        <stop offset="1" stop-color="#737373" />
                    </linearGradient>
                </defs>
            </svg>

        )
    }
}

export const Grid = React.memo(GridComponent);