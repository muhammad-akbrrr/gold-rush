import React from 'react';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const { useRef } = React;

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: string;
}

export function Button(props: ButtonProps) {
    const { children, onClick, className = "", variant = "default" } = props;

    const container = useRef<HTMLDivElement>(null);
    const timeline = useRef<gsap.core.Timeline | null>(null);
    const tween = useRef<gsap.core.Tween | null>(null);

    useGSAP(() => {
        const btn = container.current?.querySelector('.btn') as HTMLButtonElement;
        const label = container.current?.querySelector('.label') as HTMLDivElement;
        const labelPseudo = container.current?.querySelector('.label-pseudo') as HTMLDivElement;
        const btnBg = container.current?.querySelector('.btn-bg') as HTMLDivElement;

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
        } else {
            const hoverIn = () => {
                timeline.current = gsap.timeline().to(btn, { x: 4, y: 4 });
                tween.current = gsap.to(label, { y: -1, duration: 0.1, delay: 0.35 });
                tween.current = gsap.to(label, { y: 0, duration: 0.1, delay: 0.4 });
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
                        className={`btn relative px-4 py-2 bg-background border border-foreground text-foreground ${className}`}
                    >
                        <div className='btn-bg absolute inset-0 m-auto bg-foreground scale-y-0 origin-bottom'></div>
                        <div className='relative overflow-hidden'>
                            <div className='label'>
                                {children}
                            </div>
                            <div className='label-pseudo absolute left-0 right-0 mx-auto top-1/2 translate-y-1/2 text-background'>{children}</div>
                        </div>
                    </button>
                </div>
            )
        default:
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
            )
    }
}