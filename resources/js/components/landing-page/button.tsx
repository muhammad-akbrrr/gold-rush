import React, { useState } from 'react';

import { cn } from '@/lib/utils';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useIsMobile } from '@/hooks/use-mobile';

gsap.registerPlugin(useGSAP);

const { useRef } = React;

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: string;
}

export function Button(props: ButtonProps) {
    const isMobile = useIsMobile();
    const { children, onClick, className, variant = 'default' } = props;

    const container = useRef<HTMLDivElement>(null);
    const timeline = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        const btn = container.current?.querySelector('[data-gsap="btn"]') || null;
        const label = container.current?.querySelector('[data-gsap="label"]') || null;
        const labelPseudo = container.current?.querySelector('[data-gsap="label-pseudo"]') || null;
        const btnBg = container.current?.querySelector('[data-gsap="btn-bg"]') || null;
        
        if (variant === 'nav') {
            if (isMobile) return; // skip if not mobile
            timeline.current = gsap.timeline({ paused: true })
                .to(label, { yPercent: -100 })
                .to(labelPseudo, { yPercent: -100 }, 0)
                .to(btnBg, { scaleY: 1 }, 0)
                .to(btn, { borderColor: 'var(--background)' }, 0);

            const hoverIn = () => timeline.current?.play();
            const hoverOut = () => timeline.current?.reverse();

            btn?.addEventListener('mouseenter', hoverIn);
            btn?.addEventListener('mouseleave', hoverOut);

            return () => {
                btn?.removeEventListener('mouseenter', hoverIn);
                btn?.removeEventListener('mouseleave', hoverOut);
            };
        } else if (variant === 'cta') {
            timeline.current = gsap.timeline({ paused: true })
                .to(btnBg, { scaleY: 1, autoAlpha: 1, duration: 1 })
                .to(label, { yPercent: -100 }, 0)
                .to(labelPseudo, { yPercent: -100 }, 0);

            const hoverIn = () => timeline.current?.play();
            const hoverOut = () => timeline.current?.reverse();

            btn?.addEventListener('mouseenter', hoverIn);
            btn?.addEventListener('mouseleave', hoverOut);

            return () => {
                btn?.removeEventListener('mouseenter', hoverIn);
                btn?.removeEventListener('mouseleave', hoverOut);
            };
        } else {
            timeline.current = gsap.timeline({ paused: true })
                .to(btn, { x: 4, y: 4 })
                .to(label, { y: -1, duration: 0.1, delay: 0.35 })
                .to(label, { y: 0, duration: 0.1, delay: 0.4 });

            const hoverIn = () => timeline.current?.play();
            const hoverOut = () => timeline.current?.reverse();

            btn?.addEventListener('mouseenter', hoverIn);
            btn?.addEventListener('mouseleave', hoverOut);

            return () => {
                btn?.removeEventListener('mouseenter', hoverIn);
                btn?.removeEventListener('mouseleave', hoverOut);
            };
        }
    },
        { scope: container },
    );

    switch (variant) {
        case 'nav':
            return (
                <div ref={container} className="relative max-w-fit">
                    <button
                        onClick={onClick}
                        data-gsap="btn"
                        className={cn(`btn relative flex cursor-pointer border border-foreground bg-background px-4 py-2 text-foreground`, className)}
                    >
                        <div data-gsap="btn-bg" className="absolute inset-0 m-auto origin-bottom scale-y-0 bg-foreground"></div>
                        <div className="relative overflow-hidden">
                            <div data-gsap="label">{children}</div>
                            <div data-gsap="label-pseudo" className="absolute top-1/2 right-0 left-0 mx-auto translate-y-1/2 text-background">
                                {children}
                            </div>
                        </div>
                    </button>
                </div>
            );
        case 'cta':
            return (
                <div ref={container} className={cn(className, 'relative flex h-[68px] items-center justify-center text-center text-background')}>
                    <button data-gsap="btn" onClick={onClick} className="w-full cursor-pointer">
                        <div data-gsap="btn-bg" className="absolute -inset-5 bg-radial from-[#FEFDBF]/60 to-[#FEFDBF]/0 to-65% opacity-0" />
                        <div className="clip-bevel absolute inset-0 bg-[#FEFDBF]" />
                        <div className="clip-bevel absolute inset-[1px] bg-foreground" />
                        <div className="clip-bevel absolute inset-[1px] bg-linear-to-b from-[#989772]/50 to-[#E1CFAE] opacity-50 shadow-[0_4px_0_rgba(254,253,191,0.25)]" />
                        <div className="relative overflow-hidden">
                            <div data-gsap="label" className="text-shadow-2xl relative text-shadow-slate-1000">
                                {children}
                            </div>
                            <div
                                data-gsap="label-pseudo"
                                className="text-shadow-2xl absolute inset-0 m-auto w-full translate-y-full text-shadow-slate-1000"
                            >
                                {children}
                            </div>
                        </div>
                    </button>
                </div>
            );
        default:
            return (
                <div ref={container} className={cn(className, "relative max-w-fit")}>
                    <div data-gsap="btn-bg" className={"absolute top-1 left-1 h-full w-full bg-foreground"}></div>
                    <button
                        onClick={onClick}
                        data-gsap="btn"
                        className={cn(`w-full relative cursor-pointer border border-foreground bg-background px-4 py-2 text-foreground`)}
                    >
                        <div data-gsap="label">{children}</div>
                    </button>
                </div>
            );
    }
}
