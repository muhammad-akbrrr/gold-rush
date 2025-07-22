import React from 'react';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const { useRef } = React;

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, className = "" }) => {

    const container = useRef<HTMLDivElement>(null);

    const hoverTween = useRef<gsap.core.Tween | null>(null);

    const { contextSafe } = useGSAP({ scope: container })

    const btnHoverIn = contextSafe(() => {
        hoverTween.current = gsap.to('.btn', { x: 4, y: 4 })
    })

    const btnHoverOut = contextSafe(() => {
        // If the tween exists, reverse it
        if (hoverTween.current) {
            hoverTween.current.reverse();
        }
    });

    return (
        <div ref={container} className='relative max-w-fit'>
            <div className='btn-bg w-full h-full absolute left-1 top-1 bg-foreground'></div>
            <button
                onClick={onClick}
                onMouseEnter={btnHoverIn}
                onMouseLeave={btnHoverOut}
                className={`btn relative px-4 py-2 bg-background border border-foreground text-foreground ${className}`}
            >
                {children}
            </button>
        </div>
    );
}