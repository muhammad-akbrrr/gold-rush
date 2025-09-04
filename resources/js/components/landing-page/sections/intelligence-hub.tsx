'use client';
import React, { useEffect, useState } from 'react';

import { Separator } from '@/components/ui/separator';
import { Hq } from './intelligence-hub/hq';

import { InteractiveGridPattern } from '@/components/magicui/interactive-grid-pattern';
import { Marquee } from '@/components/magicui/marquee';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import HistorianAnim, { HistorianAnimRef } from './intelligence-hub/historian-anim';
import { PriceTicker } from './intelligence-hub/price-ticker';

gsap.registerPlugin(SplitText);

const { useRef } = React;

export const IntelligenceHub = () => {
    const isMobile = useIsMobile();
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [gridSize, setGridSize] = useState<number>(0);

    const container = useRef<HTMLDivElement>(null);
    useGSAP(() => {
        if (activeIndex !== null) {
            const tabs = gsap.utils.toArray<HTMLElement>('img', container.current);

            gsap.to(tabs, { filter: 'saturate(0)', duration: 0.3 });
            gsap.to(tabs[activeIndex], { filter: 'saturate(1)', duration: 0.3 });
        }
    }, [activeIndex, container]);

    const images = ['/images/tab-historian.webp', '/images/tab-candle.webp', '/images/tab-globe.webp'];

    const contents = {
        selected: ['The Historian', 'Live Market Intel', 'The Living Atlas'],
        source: ['Private Archives', 'Real-time Feeds', 'Community & AI'],
        function: ['On-demand Expert', 'Dynamic Overview', 'Evolving Frontier'],
        headText: ['Your On-Demand Gold Expert', 'Your Real-time Market Pulse', 'The Evolving Map of Discovery'],
        title: ['The Historian AI', 'Live Market Intel', 'The Living Atlas'],
        desc: [
            'Stop digging through scattered sources. Our AI is trained on a focused dataset of market history, geological reports, and platform rules. Get summarized, relevant answers in seconds.',
            "Don't just watch the ticker. Our dashboard integrates live price data with breaking news and company announcements, providing a comprehensive, real-time view of the market's heartbeat.",
            "This isn't a game map, it's your strategic overview. Visually track where real-world companies are exploring and announcing findings. Use it to connect the dots and inform your own research.",
        ],
    };

    const imgSrc = ['/images/check.webp', '/images/candle.webp', '/images/globe.webp'];

    const riveRef = useRef<HistorianAnimRef | null>(null);

    // GSAP
    const sectionContainer = useRef<HTMLDivElement>(null);
    const riveContainer = useRef<HTMLDivElement>(null);
    useGSAP(
        () => {
            const tab = gsap.utils.toArray<HTMLElement>('.tab', container.current);

            gsap.timeline({
                scrollTrigger: {
                    trigger: riveContainer.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
                defaults: { ease: 'none' },
            }).fromTo('.historian-anim', { yPercent: -100 }, { yPercent: 100 });

            gsap.timeline({
                scrollTrigger: {
                    trigger: sectionContainer.current,
                    start: 'top bottom',
                },
                defaults: { ease: 'none' },
            }).add(() => {
                riveRef.current?.fireTrigger(0);
            });

            tab.forEach((el, index) => {
                el.addEventListener('click', () => {
                    gsap.to('.ticker-wrapper', {
                        yPercent: index === 1 ? -100 : 100,
                        duration: 1,
                    });
                });
            });

            // Tab animation
            const selected = gsap.utils.toArray<HTMLElement>('[data-gsap="selected"]', sectionContainer.current);
            const source = gsap.utils.toArray<HTMLElement>('[data-gsap="source"]', sectionContainer.current);
            const functionEl = gsap.utils.toArray<HTMLElement>('[data-gsap="function"]', sectionContainer.current);
            const headText = gsap.utils.toArray<HTMLElement>('[data-gsap="head-text"]', sectionContainer.current);
            const title = gsap.utils.toArray<HTMLElement>('[data-gsap="title"]', sectionContainer.current);
            const descEls = gsap.utils.toArray<HTMLElement>('.split', sectionContainer.current);
            const images = gsap.utils.toArray<HTMLElement>('[data-gsap="image"]', sectionContainer.current);

            if ([selected, source, functionEl, headText, title].some((nl) => nl.length === 0) || descEls.length === 0 || images.length === 0) return;

            const descSplits = descEls.map((el) => new SplitText(el, { type: 'lines' }));

            gsap.set(selected.slice(1), { xPercent: -5, yPercent: 50, scaleY: 0 });
            gsap.set(source.slice(1), { xPercent: -5, yPercent: 50, scaleY: 0 });
            gsap.set(functionEl.slice(1), { xPercent: -5, yPercent: 50, scaleY: 0 });
            gsap.set(headText.slice(1), { xPercent: -5, yPercent: 50, scaleY: 0 });
            gsap.set(title.slice(1), { xPercent: -5, yPercent: 50, scaleY: 0 });
            descSplits.forEach((split, i) => {
                gsap.set(split.lines, { display: 'block', overflow: 'hidden' });
                if (i !== 0) gsap.set(split.lines, { yPercent: 100, scaleY: 0, opacity: 0 });
            });
            gsap.set(images.slice(1), { opacity: 0 });

            let prevIndex = 0;
            let idx = 0;

            const clickHandler = (next: number) => {
                if (next === idx) return;
                prevIndex = idx;
                idx = next;
                const prevTexts = [selected[prevIndex], source[prevIndex], functionEl[prevIndex], headText[prevIndex], title[prevIndex]];
                const nextTexts = [selected[idx], source[idx], functionEl[idx], headText[idx], title[idx]];

                gsap.timeline()
                    .fromTo(
                        prevTexts,
                        {
                            xPercent: 0,
                            yPercent: 0,
                            scaleY: 1,
                        },
                        {
                            xPercent: 5,
                            yPercent: -50,
                            scaleY: 0,
                            opacity: 0,
                            stagger: 0.1,
                        },
                    )
                    .fromTo(
                        nextTexts,
                        {
                            xPercent: -5,
                            yPercent: 50,
                            scaleY: 0,
                        },
                        {
                            xPercent: 0,
                            yPercent: 0,
                            scaleY: 1,
                            opacity: 1,
                            stagger: 0.1,
                        },
                        0,
                    )
                    .to(
                        descSplits[prevIndex].lines,
                        {
                            xPercent: 5,
                            yPercent: -50,
                            scaleY: 0,
                            opacity: 0,
                            stagger: 0.03,
                        },
                        0,
                    )
                    .fromTo(
                        descSplits[idx].lines,
                        {
                            xPercent: -5,
                            yPercent: 100,
                            scaleY: 0,
                            opacity: 0,
                        },
                        {
                            xPercent: 0,
                            yPercent: 0,
                            scaleY: 1,
                            opacity: 1,
                            stagger: 0.03,
                        },
                        0.1,
                    )
                    .fromTo(
                        images[prevIndex],
                        {
                            opacity: 1,
                        },
                        {
                            opacity: 0,
                        },
                        0,
                    )
                    .fromTo(
                        images[idx],
                        {
                            opacity: 0,
                        },
                        {
                            opacity: 1,
                        },
                        0,
                    );
            };

            const removers: Array<() => void> = [];
            tab.forEach((el, i) => {
                const handler = () => clickHandler(i);
                el.addEventListener('click', handler);
                removers.push(() => el.removeEventListener('click', handler));
            });

            return () => {
                removers.forEach((fn) => fn());
                descSplits.forEach((s) => s.revert());
            };
        },
        { scope: riveContainer, dependencies: [isMobile] },
    );

    useEffect(() => {
        const section = document.querySelector('#intelligence-hub');
        const riveColumn = section?.querySelector('.rive-column');

        if (!riveColumn) return;

        setGridSize((riveColumn.clientWidth || 24) / 5);
    }, [isMobile]);

    return (
        <section
            ref={sectionContainer}
            id="intelligence-hub"
            className="relative z-0 flex max-h-dvh min-h-svh flex-col justify-between overflow-hidden bg-background text-xl text-muted-foreground xl:max-h-svh"
        >
            <h2 className="sr-only">Intelligence Hub</h2>
            <Separator className="mt-24" />
            <div className="flex-1 md:grid md:grid-cols-3">
                <div className="relative flex flex-col justify-between gap-4">
                    <div className="mx-4 flex flex-1 flex-col justify-center gap-4 py-4 font-bold md:mx-12">
                        {useIsMobile() ? (
                            <p className="text-4xl">The Modern Prospectors’ HQ</p>
                        ) : (
                            <>
                                <p>The Modern Prospectors’</p>
                                <Hq className="h-auto w-full" />
                            </>
                        )}
                    </div>
                    <div className="flex flex-1 flex-col items-stretch text-base font-bold uppercase md:text-xl">
                        <Separator />
                        <div className="mx-4 flex flex-1 items-center py-2 md:mx-12">
                            <div>Selected:</div>
                            <div className={`relative ms-2 h-full w-full`}>
                                {contents.selected.map((title) => {
                                    return (
                                        <div className={'absolute flex h-full items-center'}>
                                            <div className="relative" data-gsap={`selected`}>
                                                {title}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <Separator />
                        <div className="mx-4 flex flex-1 items-center py-2 md:mx-12">
                            <div>Source:</div>
                            <div className={`relative ms-2 h-full w-full`}>
                                {contents.function.map((title) => {
                                    return (
                                        <div className={'absolute flex h-full items-center'}>
                                            <div className="relative" data-gsap={`source`}>
                                                {title}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <Separator />
                        <div className="mx-4 flex flex-1 items-center py-2 md:mx-12">
                            <div>Function:</div>
                            <div className={`relative ms-2 h-full w-full`}>
                                {contents.source.map((title) => {
                                    return (
                                        <div className={'absolute flex h-full items-center'}>
                                            <div className="relative" data-gsap={`function`}>
                                                {title}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <Separator />
                    </div>
                    <div ref={container} className="mx-4 grid grid-cols-3 items-center justify-between gap-4 py-4 md:mx-12">
                        {images.map((src, index) => {
                            return (
                                <img
                                    key={index}
                                    src={src}
                                    onClick={() => {
                                        setActiveIndex(index);
                                        riveRef.current?.fireTrigger(index); // 🔥 This triggers the Rive animation
                                    }}
                                    className={`tab cursor-pointer transition-all duration-300`}
                                    alt={`Image ${index}`}
                                />
                            );
                        })}
                    </div>
                    <Separator orientation="vertical" className="absolute right-0" />
                </div>
                {!useIsMobile() && (
                    <div ref={riveContainer} className="rive-column relative overflow-hidden">
                        <InteractiveGridPattern width={gridSize} height={gridSize} className="absolute inset-0 mx-auto grid w-auto" />
                        <HistorianAnim ref={riveRef} className="historian-anim pointer-events-none absolute h-full w-full" />
                        <div className="ticker-wrapper absolute bottom-0 flex max-h-3/4 w-full translate-y-full flex-col gap-4 bg-background pb-4">
                            <Separator />
                            <div className="mx-4 text-3xl font-bold uppercase">Live Gold Price</div>
                            <PriceTicker />
                            <Separator />
                            <span className="mx-4 text-3xl font-bold uppercase">Latest gold news</span>
                            <Marquee vertical={true} className="flex max-h-1/2 flex-col gap-4">
                                <div className="text-main mx-4 font-[Lekton] font-bold">
                                    Wall Street thrives while Main Street struggles: Financial Stress Index soars to pandemic-era levels
                                    <div className="text-sm font-normal">9 hours ago</div>
                                </div>
                                <div className="text-main mx-4 font-[Lekton] font-bold">
                                    Wall Street thrives while Main Street struggles: Financial Stress Index soars to pandemic-era levels
                                    <div className="text-sm font-normal">9 hours ago</div>
                                </div>
                                <div className="text-main mx-4 font-[Lekton] font-bold">
                                    Wall Street thrives while Main Street struggles: Financial Stress Index soars to pandemic-era levels
                                    <div className="text-sm font-normal">9 hours ago</div>
                                </div>
                                <div className="text-main mx-4 font-[Lekton] font-bold">
                                    Wall Street thrives while Main Street struggles: Financial Stress Index soars to pandemic-era levels
                                    <div className="text-sm font-normal">9 hours ago</div>
                                </div>
                            </Marquee>
                        </div>
                    </div>
                )}
                <div className="relative flex flex-col items-stretch justify-between gap-4">
                    <Separator orientation={useIsMobile() ? 'horizontal' : 'vertical'} className="absolute left-0" />
                    <div className="text-large mx-4 flex flex-col gap-4 py-4 font-bold md:mx-12">
                        <div className="relative h-4 capitalize">
                            {/* {contents.headText[activeIndex]} */}
                            {contents.headText.map((title, index) => {
                                return (
                                    <div className="absolute">
                                        <div key={index} className="relative" data-gsap="head-text">
                                            {title}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="h-6 text-3xl font-bold uppercase md:text-4xl 2xl:text-5xl">
                            {contents.title.map((title, index) => {
                                return (
                                    <div className="absolute">
                                        <div key={index} className="relative" data-gsap="title">
                                            {title}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {!isMobile && (
                        <>
                            <div className="relative">
                                {imgSrc.map((src, index) => {
                                    return (
                                        <div className="not-first:absolute not-first:top-0" key={index}>
                                            <img data-gsap="image" src={src} className="mx-auto w-1/2" alt={`Image ${index}`} />
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    <div className="relative mx-4 flex flex-col justify-end py-0 font-[Lekton] text-base/6 md:mx-12 xl:py-12 xl:text-lg/7 2xl:text-xl/8">
                        {contents.desc.map((desc, index) => {
                            return (
                                <div key={index} className="not-first:absolute">
                                    <div className="split">{desc}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <Separator className="xl:mb-12" />
        </section>
    );
};
