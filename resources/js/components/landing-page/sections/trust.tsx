import { useGSAP } from '@gsap/react';
import { useEffect, useRef, useState } from 'react';
import { InteractiveGridPattern } from '../../magicui/interactive-grid-pattern';
import { Separator } from '../../ui/separator';
import { TrustAnim } from './trust/trust-anim';

import { useIsMobile } from '@/hooks/use-mobile';
import gsap from 'gsap';

export const Trust = () => {
    const [gridSize, setGridSize] = useState<number>(0);
    const isMobile = useIsMobile();

    useEffect(() => {
        setGridSize(window.innerWidth / (isMobile ? 5 : 12));
    }, [isMobile]);

    const container = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const trustAnim = container.current?.querySelector('[data-gsap="trust-anim"]');

            if (!trustAnim) return;

            gsap.timeline({
                scrollTrigger: {
                    trigger: container.current,
                    start: isMobile ? 'top top+=56rem' : 'top top',
                    end: 'bottom top',
                    scrub: true,
                    pin: true,
                    pinSpacing: false,
                    invalidateOnRefresh: true,
                },
            });

            gsap.timeline({
                scrollTrigger: {
                    trigger: container.current,
                    start: 'top bottom',
                    end: 'top top+=44rem',
                    scrub: true,
                },
            }).from(trustAnim, { yPercent: -100, ease: 'none' });
        },
        { scope: container },
    );

    return (
        <section ref={container} className="flex h-screen w-full flex-col items-center overflow-hidden bg-background text-muted-foreground">
            <Separator className="grow-0" />
            <h2 className="mx-4 my-4 text-center text-3xl font-bold uppercase md:mx-12 xl:text-8xl 2xl:text-9xl">
                Built for utility. Measured by uptime.
            </h2>
            <Separator className="grow-0" />
            <div className="relative h-full w-full overflow-hidden px-4 pt-12 md:px-12">
                <InteractiveGridPattern width={gridSize} height={gridSize} className="h-full w-full" />
                <TrustAnim
                    data-gsap="trust-anim"
                    className="absolute -top-10 left-0 h-full w-full touch-pan-y xl:top-0 xl:h-[50svh] xl:max-h-11/12"
                />
            </div>
        </section>
    );
};
