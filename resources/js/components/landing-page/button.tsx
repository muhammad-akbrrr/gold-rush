import React from 'react';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const { useRef } = React;

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: string;
}

export function Button(props: ButtonProps) {
    const { children, onClick, className, variant = "default" } = props;

    const container = useRef<HTMLDivElement>(null);
    const timeline = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        const btn = container.current?.querySelector('[data-gsap="btn"]') || null;
        const label = container.current?.querySelector('[data-gsap="label"]') || null;
        const labelPseudo = container.current?.querySelector('[data-gsap="label-pseudo"]') || null;
        const btnBg = container.current?.querySelector('[data-gsap="btn-bg"]') || null;

        if (variant === "nav") {
            const hoverIn = () => {
                timeline.current = gsap.timeline()
                    .to(label, { yPercent: -100 })
                    .to(labelPseudo, { yPercent: -100 }, 0)
                    .to(btnBg, { scaleY: 1 }, 0)
                    .to(btn, { borderColor: "var(--background)" }, 0)
            };

            const hoverOut = () => timeline.current?.reverse();

            btn?.addEventListener('mouseenter', hoverIn);
            btn?.addEventListener('mouseleave', hoverOut);

            return () => {
                btn?.removeEventListener('mouseenter', hoverIn);
                btn?.removeEventListener('mouseleave', hoverOut);
            };
        } else if (variant === "cta") {
            const hoverIn = () => {
                timeline.current = gsap.timeline()
                    .to(btnBg, { scaleY: 1, autoAlpha: 1, duration: 1 })
                    .to(label, { yPercent: -100 }, 0)
                    .to(labelPseudo, { yPercent: -100 }, 0)
            };

            const hoverOut = () => timeline.current?.reverse();

            btn?.addEventListener('mouseenter', hoverIn);
            btn?.addEventListener('mouseleave', hoverOut);

            return () => {
                btn?.removeEventListener('mouseenter', hoverIn);
                btn?.removeEventListener('mouseleave', hoverOut);
            };

        } else {
            const hoverIn = () => {
                timeline.current = gsap.timeline()
                    .to(btn, { x: 4, y: 4 })
                    .to(label, { y: -1, duration: 0.1, delay: 0.35 })
                    .to(label, { y: 0, duration: 0.1, delay: 0.4 });
            };

            const hoverOut = () => timeline.current?.reverse();

            btn?.addEventListener('mouseenter', hoverIn);
            btn?.addEventListener('mouseleave', hoverOut);

            return () => {
                btn?.removeEventListener('mouseenter', hoverIn);
                btn?.removeEventListener('mouseleave', hoverOut);
            };
        }
    }, { scope: container });

    switch (variant) {
        case "nav":
            return (
                <div ref={container} className='relative max-w-fit'>
                    <button
                        onClick={onClick}
                        data-gsap="btn"
                        className={cn(`btn relative px-4 py-2 bg-background border border-foreground text-foreground cursor-pointer`, className)}
                    >
                        <div data-gsap="btn-bg" className='absolute inset-0 m-auto bg-foreground scale-y-0 origin-bottom'></div>
                        <div className='relative overflow-hidden'>
                            <div data-gsap="label">
                                {children}
                            </div>
                            <div
                                data-gsap="label-pseudo"
                                className='absolute left-0 right-0 mx-auto top-1/2 translate-y-1/2 text-background'
                            >
                                {children}
                            </div>
                        </div>
                    </button>
                </div>
            )
        case "cta":
            return (
                <div ref={container} className={cn(className, 'relative h-[68px] text-background text-center flex items-center justify-center')}>
                    <button data-gsap="btn" onClick={onClick} className='w-full cursor-pointer'>
                        <div data-gsap="btn-bg" className='absolute -inset-5 bg-radial from-[#FEFDBF]/60 to-[#FEFDBF]/0 to-65% opacity-0' />
                        <div className='absolute inset-0 bg-[#FEFDBF] clip-bevel' />
                        <div className='absolute inset-[1px] bg-foreground clip-bevel' />
                        <div className='absolute inset-[1px] bg-linear-to-b from-[#989772]/50 to-[#E1CFAE] clip-bevel shadow-[0_4px_0_rgba(254,253,191,0.25)] opacity-50' />
                        <div className='relative overflow-hidden'>
                            <div data-gsap="label" className='relative text-shadow-2xl text-shadow-slate-1000'>
                                {children}
                            </div>
                            <div data-gsap="label-pseudo" className='absolute w-full inset-0 m-auto translate-y-full text-shadow-2xl text-shadow-slate-1000'>
                                {children}
                            </div>
                        </div>
                    </button>
                </div>
            )
        default:
            return (
                <div ref={container} className='relative max-w-fit'>
                    <div data-gsap="btn-bg" className='w-full h-full absolute left-1 top-1 bg-foreground'></div>
                    <button
                        onClick={onClick}
                        data-gsap="btn"
                        className={cn(`relative px-4 py-2 bg-background border border-foreground text-foreground cursor-pointer`, className)}
                    >
                        <div data-gsap="label">
                            {children}
                        </div>
                    </button>
                </div>
            )
    }
}