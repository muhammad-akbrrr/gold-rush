import { Separator } from '@/components/ui/separator';
import { Map } from './live-operation/map';

import { InteractiveGridPattern } from '@/components/magicui/interactive-grid-pattern';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import DrawSVGPlugin from 'gsap/DrawSVGPlugin';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

export const LiveOperation = () => {
    const container = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    const [gridSize, setGridSize] = useState<number>(0);

    useEffect(() => {
        setGridSize(window.innerWidth / (isMobile ? 5 : 12));
    }, [isMobile]);

    useGSAP(
        () => {
            const map = container.current?.querySelector('.map');

            if (!map) return;

            gsap.set('.dots', { willChange: 'opacity' });

            const ctx = gsap.context(() => {
                // Map axis
                gsap.timeline({
                    scrollTrigger: {
                        trigger: container.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                    defaults: { ease: 'none' },
                }).fromTo(map, { yPercent: -100 }, { yPercent: 100 });

                // Main map animation
                gsap.timeline({
                    scrollTrigger: {
                        trigger: container.current,
                        start: 'top bottom',
                        end: 'top top',
                        scrub: 1,
                    },
                    defaults: { ease: 'none' },
                });
                // .from('.map .dots path', {
                //     autoAlpha: 0,
                //     duration: 1,
                //     stagger: {
                //         from: 'random',
                //         each: .05
                //     }
                // }, 0)

                // Paper animation
                gsap.timeline({
                    scrollTrigger: {
                        trigger: container.current,
                        start: 'top bottom',
                        toggleActions: 'play none none reset',
                    },
                    defaults: { duration: 1, transformOrigin: 'bottom' },
                })
                    .from('.paper-1', { autoAlpha: 0, rotate: -7 })
                    .from('.paper-2', { autoAlpha: 0, rotate: 8 }, 0)
                    .from('.map .strings path', { autoAlpha: 0, drawSVG: 0 }, 0.1);
            }, container);

            return () => ctx.revert();
        },
        { scope: container },
    );

    return (
        <section className="relative z-0 flex min-h-svh flex-col overflow-hidden bg-background text-muted-foreground">
            <Separator></Separator>
            <div className="mx-auto flex flex-1 grid-cols-12 flex-col lg:grid">
                <div className="col-span-4 flex flex-col justify-between gap-8">
                    <div className="ms-4 flex flex-col gap-4 pe-4 pt-4 lg:ms-12 lg:pt-24">
                        <h2 className="text-2xl font-bold uppercase xl:text-5xl 2xl:text-7xl">Your Live Operation</h2>
                        <span className="text-large font-bold lg:text-xl">Three core instruments. One mission: intelligence.</span>
                    </div>
                    <Separator></Separator>
                    <div className="ms-4 flex flex-1 flex-col justify-between gap-4 pe-4 text-base lg:ms-12 xl:text-xl">
                        <div className="flex flex-col gap-2">
                            <span className="font-bold uppercase lg:text-2xl">The Map (Visual Database)</span>
                            <p className="font-[Lekton]">
                                A dynamic, interactive map tracking real-world mining news, geological data releases, and corporate exploration
                                updates. It’s not a game; it’s a visual database for your strategic analysis.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="font-bold uppercase lg:text-2xl">The Historian AI (Your Researcher)</span>
                            <p className="font-[Lekton]">
                                Your on-demand analyst. Ask it about historical gold prices, company exploration histories, or the mechanics of this
                                platform. It digests the data so you can focus on the insights.
                            </p>
                        </div>
                        <div className="mb-12 flex flex-col gap-2">
                            <span className="font-bold uppercase lg:text-2xl">The Pulse (Real-time Feed)</span>
                            <p className="font-[Lekton]">
                                A constant stream of curated gold news, live market tickers, and significant event alerts. This is your real-time
                                signal feed, designed to keep you ahead of the narrative
                            </p>
                        </div>
                    </div>
                </div>
                <div
                    ref={container}
                    className="relative order-first col-span-8 flex items-center justify-center overflow-hidden bg-foreground p-4 lg:order-last lg:p-24"
                >
                    <InteractiveGridPattern
                        className="map-grid absolute inset-0 m-auto h-full w-full opacity-20"
                        width={gridSize}
                        height={gridSize}
                    />
                    <Map />
                </div>
            </div>
            <Separator></Separator>
        </section>
    );
};
