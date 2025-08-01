"use client";
import React, { useEffect } from "react";
import { useState } from "react";

import { Separator } from "@/components/ui/separator"
import { Hq } from "./intelligence-hub/hq";
import { Grid } from "@/components/grid";

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import HistorianAnim, { HistorianAnimRef } from "./intelligence-hub/historian-anim";
import { Marquee } from "@/components/magicui/marquee";
import { PriceTicker } from "./intelligence-hub/price-ticker";
import { useIsMobile } from "@/hooks/use-mobile";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";

const { useRef } = React;

export const IntelligenceHub = () => {
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
        '/images/36523362.png',
        '/images/36523363.png',
        '/images/36523364.png',
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
    }, { scope: riveContainer })

    useEffect(() => {
        const section = document.querySelector('#intelligence-hub');
        const riveColumn = section?.querySelector('.rive-column')

        setGridSize((riveColumn?.clientWidth || 24) / 5)
    }, [])

    return (
        <section ref={sectionContainer} id="intelligence-hub" className='flex flex-col min-h-svh relative z-0 overflow-hidden bg-background text-muted-foreground text-xl'>
            <h2 className="sr-only">Intelligence Hub</h2>
            <Separator className="mt-24" />
            <div className="flex-1 md:grid grid-cols-3">
                <div className="relative flex flex-col gap-4 justify-between">
                    <div className="flex-1 flex flex-col justify-center gap-4 font-bold mx-4 md:mx-12 py-4">
                        <p>The Modern Prospectors’</p>
                        <Hq className="w-full h-auto" />
                    </div>
                    <div className="flex-1 flex flex-col items-stretch font-bold uppercase text-base md:text-xl">
                        <Separator />
                        <p className="flex-1 flex items-center mx-4 md:mx-12">
                            Selected: {contents.selected[activeIndex]}
                        </p>
                        <Separator />
                        <p className="flex-1 flex items-center mx-4 md:mx-12">
                            Source: {contents.source[activeIndex]}
                        </p>
                        <Separator />
                        <p className="flex-1 flex items-center mx-4 md:mx-12">
                            Function: {contents.function[activeIndex]}
                        </p>
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
                <div className="relative flex flex-col gap-4 items-stretch justify-between">
                    <Separator orientation="vertical" className="absolute left-0" />
                    <div className="flex flex-col gap-4 text-large font-bold mx-4 md:mx-12 py-4">
                        <p className="capitalize">{contents.headText[activeIndex]}</p>
                        <p className="text-3xl md:text-4xl 2xl:text-5xl font-bold uppercase">{contents.title[activeIndex]}</p>
                    </div>
                    {
                        useIsMobile() ?
                            <>
                            </>
                            :
                            <>
                                <img src="/images/check.png" className="w-1/2 mx-auto" />
                            </>
                    }
                    <p className="flex flex-col justify-end mx-4 md:mx-12 py-12 text-base/6 xl:text-lg/7 2xl:text-xl/8 font-[Lekton]">
                        {contents.desc[activeIndex]}
                    </p>
                </div>
            </div>
            <Separator className="mb-12" />
        </section>
    )
}