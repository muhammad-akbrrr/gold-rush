import { useEffect, useRef, useState } from 'react';

import { InteractiveGridPattern } from '@/components/magicui/interactive-grid-pattern';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { HeroAnim } from './hero/hero-anim';
import { Title } from './hero/title';

gsap.registerPlugin(ScrollTrigger);

export const HeroSection = () => {
    const container = useRef<HTMLDivElement | null>(null);
    const [gridSize, setGridSize] = useState<number>(0);
    const isMobile = useIsMobile();

    useEffect(() => {
        setGridSize(window.innerWidth / (isMobile ? 5 : 12));
    }, [isMobile]);

    useGSAP(
        () => {
            const grid = container.current?.querySelector('[data-gsap="grid"]') || null;

            if (!grid) return;

            gsap.timeline({
                scrollTrigger: {
                    trigger: container.current,
                    start: 'bottom bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            }).to(grid, {
                yPercent: 100,
                ease: 'none',
            });

            // return () => {
            //     ScrollTrigger.getAll().forEach(st => st.kill());
            // };
        },
        { scope: container },
    );

    return (
        <section ref={container} className="relative z-0 flex min-h-svh flex-col justify-between overflow-hidden bg-background text-muted-foreground">
            <InteractiveGridPattern data-gsap="grid" width={gridSize} height={gridSize} className="top-1/2 h-full w-full xl:top-0 xl:left-1/2" />
            <div className="relative bg-background pt-18 xl:pt-24">
                <Title type="big" className="mx-4 text-muted-foreground md:mx-8 xl:mx-12" />
                <Separator className="mt-4 xl:mt-8" />
            </div>
            <div className="pointer-events-none relative flex flex-1 flex-col items-center gap-4 xl:grid xl:grid-cols-2">
                <div className="px-4 pt-4 font-[Lekton] text-xl leading-relaxed xl:ps-12 xl:text-2xl">
                    We are building a structured, intelligence-driven platform — a frontier where discipline, data, and design converge to define the
                    next era of digital discovery. This is an evolution in participation: serious, methodical, and built on a foundation of quality.
                </div>
                <div className="pointer-events-none h-full w-full xl:relative">
                    <HeroAnim className="pointer-events-none absolute bottom-0 left-1/2 h-[40svh] w-[80%] -translate-x-1/2 -scale-x-100 xl:-bottom-20 xl:h-[calc(70svh)] xl:w-[80%]" />
                </div>
            </div>
            <div className="relative bg-background pb-4 xl:pb-12">
                <Separator className="mb-4 xl:mb-8" />
                <Title type="small" className="mx-4 text-muted-foreground xl:mx-12" />
            </div>
        </section>
    );
};
