"use client";
import React, { useEffect } from "react";
import { useState } from "react";

import { Separator } from "@/components/ui/separator"
import { Hq } from "./intelligence-hub/hq";

import HistorianAnim, { HistorianAnimRef } from "./intelligence-hub/historian-anim";
import { Marquee } from "@/components/magicui/marquee";
import { PriceTicker } from "./intelligence-hub/price-ticker";
import { useIsMobile } from "@/hooks/use-mobile";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';

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

    const images = [
        '/images/tab-historian.webp',
        '/images/tab-candle.webp',
        '/images/tab-globe.webp',
    ];

    const contents = {
        selected: ["The Historian", "Live Market Intel", "The Living Atlas"],
        source: ["Private Archives", "Real-time Feeds", "Community & AI"],
        function: ["On-demand Expert", "Dynamic Overview", "Evolving Frontier"],
        headText: ["Your On-Demand Gold Expert", "Your Real-time Market Pulse", "The Evolving Map of Discovery"],
        title: ["The Historian AI", "Live Market Intel", "The Living Atlas"],
        desc: [
            "Ask any question, from complex geological queries to the rich history of the great gold rushes. The Historian is an expert AI trained exclusively on our private, curated library of rare documents, ensuring you get intelligent, on-topic answers unavailable anywhere else.",
            "Stay ahead of the curve with up-to-the-minute gold price tickers and a curated feed of essential market news. This dynamic overview keeps you informed about global trends, ensuring you're always aligned with the pulse of the precious metals market.",
            'The interactive Living Atlas brings the hunt to life. This dynamic map layers historical claims, geological data, AI hotspots, and community-verified discoveries, updating with every "sift". Chart new frontiers and unlock detailed Dossiers by exploring "hot zones".'
        ]
    }

    const imgSrc = [
        '/images/check.webp',
        '/images/candle.webp',
        '/images/globe.webp',
    ];

    const riveRef = useRef<HistorianAnimRef | null>(null);

    // GSAP
    const sectionContainer = useRef<HTMLDivElement>(null);
    const riveContainer = useRef<HTMLDivElement>(null);
    useGSAP(() => {
        const tab = gsap.utils.toArray<HTMLElement>('.tab', container.current);

        gsap.timeline({
            scrollTrigger: {
                trigger: riveContainer.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
            defaults: { ease: 'none' }
        })
            .fromTo('.historian-anim', { yPercent: -100 }, { yPercent: 100 })

        gsap.timeline({
            scrollTrigger: {
                trigger: sectionContainer.current,
                start: 'top bottom',
            },
            defaults: { ease: 'none' }
        })
            .add(() => { riveRef.current?.fireTrigger(0) })

        tab.forEach((el, index) => {
            el.addEventListener("click", () => {
                gsap.to('.ticker-wrapper', {
                    yPercent: index === 1 ? -100 : 100,
                    duration: 1
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

        if (
            [selected, source, functionEl, headText, title].some(nl => nl.length === 0) ||
            descEls.length === 0 ||
            images.length === 0
        ) return;

        const descSplits = descEls.map(el => new SplitText(el, { type: "lines" }));

        gsap.set(selected.slice(1), { xPercent: -5, yPercent: 50, scaleY: 0 });
        gsap.set(source.slice(1), { xPercent: -5, yPercent: 50, scaleY: 0 });
        gsap.set(functionEl.slice(1), { xPercent: -5, yPercent: 50, scaleY: 0 });
        gsap.set(headText.slice(1), { xPercent: -5, yPercent: 50, scaleY: 0 });
        gsap.set(title.slice(1), { xPercent: -5, yPercent: 50, scaleY: 0 });
        descSplits.forEach((split, i) => {
            gsap.set(split.lines, { display: "block", overflow: "hidden" });
            if (i !== 0) gsap.set(split.lines, { yPercent: 100, scaleY: 0, opacity: 0 });
        });
        gsap.set(images.slice(1), { opacity: 0 });

        let prevIndex = 0;
        let idx = 0;

        const clickHandler = (next: number) => {
            if (next === idx) return;
            prevIndex = idx;
            idx = next;
            const prevTexts = [
                selected[prevIndex], source[prevIndex], functionEl[prevIndex], headText[prevIndex], title[prevIndex]
            ];
            const nextTexts = [
                selected[idx], source[idx], functionEl[idx], headText[idx], title[idx]
            ];

            gsap.timeline()
                .fromTo(prevTexts, {
                    xPercent: 0, yPercent: 0, scaleY: 1
                }, {
                    xPercent: 5, yPercent: -50, scaleY: 0, opacity: 0, stagger: 0.1
                })
                .fromTo(nextTexts, {
                    xPercent: -5, yPercent: 50, scaleY: 0
                }, {
                    xPercent: 0, yPercent: 0, scaleY: 1, opacity: 1, stagger: 0.1
                }, 0)
                .to(descSplits[prevIndex].lines, {
                    xPercent: 5, yPercent: -50, scaleY: 0, opacity: 0, stagger: 0.03
                }, 0)
                .fromTo(descSplits[idx].lines, {
                    xPercent: -5, yPercent: 100, scaleY: 0, opacity: 0
                }, {
                    xPercent: 0, yPercent: 0, scaleY: 1, opacity: 1, stagger: 0.03
                }, 0.1)
                .fromTo(images[prevIndex], {
                    opacity: 1
                }, {
                    opacity: 0
                }, 0)
                .fromTo(images[idx], {
                    opacity: 0
                }, {
                    opacity: 1
                }, 0)

        }

        const removers: Array<() => void> = [];
        tab.forEach((el, i) => {
            const handler = () => clickHandler(i);
            el.addEventListener("click", handler);
            removers.push(() => el.removeEventListener("click", handler));
        });

        return () => {
            removers.forEach(fn => fn());
            descSplits.forEach(s => s.revert());
        };
    }, { scope: riveContainer })

    useEffect(() => {
        const section = document.querySelector('#intelligence-hub');
        const riveColumn = section?.querySelector('.rive-column')

        setGridSize((riveColumn?.clientWidth || 24) / 5)
    }, [isMobile])

    return (
        <section ref={sectionContainer} id="intelligence-hub" className='flex flex-col justify-between max-h-dvh xl:max-h-svh min-h-svh relative z-0 overflow-hidden bg-background text-muted-foreground text-xl'>
            <h2 className="sr-only">Intelligence Hub</h2>
            <Separator className="mt-24" />
            <div className="flex-1 md:grid md:grid-cols-3">
                <div className="relative flex flex-col gap-4 justify-between">
                    <div className="flex-1 flex flex-col justify-center gap-4 font-bold mx-4 md:mx-12 py-4">
                        {
                            useIsMobile() ?
                                <p className="text-4xl">The Modern Prospectors’ HQ</p>
                                :
                                <>
                                    <p>The Modern Prospectors’</p>
                                    <Hq className="w-full h-auto" />
                                </>
                        }
                    </div>
                    <div className="flex-1 flex flex-col items-stretch font-bold uppercase text-base md:text-xl">
                        <Separator />
                        <div className="flex-1 flex items-center mx-4 md:mx-12 py-2">
                            <div>Selected:</div>
                            <div className={`ms-2 relative w-full h-full`}>
                                {contents.selected.map((title) => {
                                    return (
                                        <div className={"absolute h-full flex items-center"}>
                                            <div className="relative" data-gsap={`selected`}>
                                                {title}
                                            </div>
                                        </div>
                                    )
                                })
                                }
                            </div>
                        </div>
                        <Separator />
                        <div className="flex-1 flex items-center mx-4 md:mx-12 py-2">
                            <div>Source:</div>
                            <div className={`ms-2 relative w-full h-full`}>
                                {contents.function.map((title) => {
                                    return (
                                        <div className={"absolute h-full flex items-center"}>
                                            <div className="relative" data-gsap={`source`}>{title}</div>
                                        </div>
                                    )
                                })
                                }
                            </div>
                        </div>
                        <Separator />
                        <div className="flex-1 flex items-center mx-4 md:mx-12 py-2">
                            <div>Function:</div>
                            <div className={`ms-2 relative w-full h-full`}>
                                {contents.source.map((title) => {
                                    return (
                                        <div className={"absolute h-full flex items-center"}>
                                            <div className="relative" data-gsap={`function`}>{title}</div>
                                        </div>
                                    )
                                })
                                }
                            </div>
                        </div>
                        <Separator />
                    </div>
                    <div ref={container} className="mx-4 md:mx-12 py-4 grid grid-cols-3 gap-4 items-center justify-between">
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
                            )
                        })}
                    </div>
                    <Separator orientation="vertical" className="absolute right-0" />
                </div>
                {!useIsMobile() &&
                    <div ref={riveContainer} className="rive-column relative overflow-hidden">
                        <InteractiveGridPattern width={gridSize} height={gridSize} className="grid w-auto absolute inset-0 mx-auto" />
                        <HistorianAnim ref={riveRef} className="absolute historian-anim w-full h-full pointer-events-none" />
                        <div className="ticker-wrapper absolute bg-background w-full max-h-3/4 bottom-0 translate-y-full flex flex-col gap-4 pb-4">
                            <Separator />
                            <div className="mx-4 text-3xl font-bold uppercase">
                                Live Gold Price
                            </div>
                            <PriceTicker />
                            <Separator />
                            <span className="text-3xl font-bold uppercase mx-4">Latest gold news</span>
                            <Marquee vertical={true} className="flex flex-col gap-4 max-h-1/2">
                                <div className="font-bold text-main mx-4 font-[Lekton]">
                                    Wall Street thrives while Main Street struggles: Financial Stress Index soars to pandemic-era levels
                                    <div className="font-normal text-sm">9 hours ago</div>
                                </div>
                                <div className="font-bold text-main mx-4 font-[Lekton]">
                                    Wall Street thrives while Main Street struggles: Financial Stress Index soars to pandemic-era levels
                                    <div className="font-normal text-sm">9 hours ago</div>
                                </div>
                                <div className="font-bold text-main mx-4 font-[Lekton]">
                                    Wall Street thrives while Main Street struggles: Financial Stress Index soars to pandemic-era levels
                                    <div className="font-normal text-sm">9 hours ago</div>
                                </div>
                                <div className="font-bold text-main mx-4 font-[Lekton]">
                                    Wall Street thrives while Main Street struggles: Financial Stress Index soars to pandemic-era levels
                                    <div className="font-normal text-sm">9 hours ago</div>
                                </div>
                            </Marquee>
                        </div>
                    </div>
                }
                <div className="relative flex flex-col gap-4 items-stretch justify-between">
                    <Separator orientation={useIsMobile() ? "horizontal" : "vertical"} className="absolute left-0" />
                    <div className="flex flex-col gap-4 text-large font-bold mx-4 md:mx-12 py-4">
                        <div className="capitalize relative h-4">
                            {/* {contents.headText[activeIndex]} */}
                            {contents.headText.map((title, index) => {
                                return (
                                    <div className="absolute">
                                        <div key={index} className="relative" data-gsap="head-text">{title}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="text-3xl md:text-4xl 2xl:text-5xl font-bold uppercase h-6">
                            {contents.title.map((title, index) => {
                                return (
                                    <div className="absolute">
                                        <div key={index} className="relative" data-gsap="title">{title}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    {!isMobile &&
                        <>
                            <div className="relative">
                                {imgSrc.map((src, index) => {
                                    return (
                                        <div className="not-first:absolute not-first:top-0" key={index}>
                                            <img data-gsap="image"
                                                src={src}
                                                className="w-1/2 mx-auto"
                                                alt={`Image ${index}`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    }
                    <div className="relative flex flex-col justify-end mx-4 md:mx-12 py-0 xl:py-12 text-base/6 xl:text-lg/7 2xl:text-xl/8 font-[Lekton]">
                        {contents.desc.map((desc, index) => {
                            return (
                                <div key={index} className="not-first:absolute">
                                    <div className="split">
                                        {desc}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <Separator className="xl:mb-12" />
        </section>
    )
}