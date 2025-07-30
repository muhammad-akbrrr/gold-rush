import React from 'react';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const { useRef } = React;

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;

export const Button = (props: ButtonProps) => {
    
    const {
        children,
        onClick,
        className,
        variant = "default",
    } = props;

    const container = useRef<HTMLDivElement>(null);
    const timeline = useRef<gsap.core.Timeline | null>(null);
    const tween = useRef<gsap.core.Tween | null>(null);

    useGSAP(() => {
        const btn = container.current?.querySelector('.btn') as HTMLButtonElement;
        const label = container.current?.querySelector('.label') as HTMLButtonElement;

        const hoverIn = () => {
            timeline.current = gsap.timeline()
                .to(btn, { x: 4, y: 4 })
            tween.current = gsap.to(label, { y: -1, duration: 0.1, delay: 0.35 })
            tween.current = gsap.to(label, { y: 0, duration: 0.1, delay: 0.4 })
        };

        const hoverOut = () => {
            timeline.current?.reverse();
        };

        btn?.addEventListener('mouseenter', hoverIn);
        btn?.addEventListener('mouseleave', hoverOut);

        return () => {
            btn?.removeEventListener('mouseenter', hoverIn);
            btn?.removeEventListener('mouseleave', hoverOut);
        };
    }, { scope: container });
    return (
        <div ref={container} className='relative max-w-fit'>
            <div className='btn-bg w-full h-full absolute left-1 top-1 bg-foreground'></div>
            <button
                onClick={onClick}
                className={`btn relative px-4 py-2 bg-background border border-foreground text-foreground ${className}`}
            >
                <div className='label'>
                    {children}
                </div>
            </button>
        </div>
    );
}