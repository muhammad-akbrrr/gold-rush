import { cn } from "@/lib/utils";
import React from "react";

interface GridProps {
    className?: string;
    variant?: string;
    spacing?: number;
}

const GridComponent = ({ className, variant, spacing }: GridProps) => {
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
            <svg className={cn("", className)} width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
                {verticals.large}
                {horizontals.large}
            </svg>
        )
    }
}

export const Grid = React.memo(GridComponent);