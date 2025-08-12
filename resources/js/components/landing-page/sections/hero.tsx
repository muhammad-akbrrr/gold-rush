import React, { useEffect, useRef, useState } from "react";

import { Marquee } from "@/components/magicui/marquee";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { Button } from "../button";
import { HeroTitleSVG } from "./hero/title";
import { GoldNugget } from "@/components/gold-nugget";
import { Separator } from "@/components/ui/separator";
import { HeroAnim } from "./hero/hero-anim";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useIsMobile } from "@/hooks/use-mobile";

gsap.registerPlugin(ScrollTrigger);

export const HeroSection = () => {

    const container = useRef(null);
    const [gridSize, setGridSize] = useState<number>(0);
    const isMobile = useIsMobile();

    useEffect(() => {
        isMobile ? setGridSize(window.innerWidth / 5) : setGridSize(window.innerWidth / 12);
    }, [isMobile]);

    useGSAP(() => {
        gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: 'bottom bottom',
                end: 'bottom top',
                scrub: true,
                pin: true,
                pinSpacing: false,
            }
        })
    }, { scope: container })

    return (
        <section className='flex flex-col min-h-svh relative z-0 overflow-hidden bg-background text-muted-foreground'>
            <div className='flex-1 flex-col lg:grid lg:grid-cols-2'>
                <div className='mx-4 lg:ms-12 lg-mx-0 pt-24 flex flex-col gap-4 justify-between pb-6'>
                    <div className='flex flex-col gap-4 text-end'>
                        <HeroTitleSVG />
                        <div className='text-xl lg:text-2xl font-bold'>
                            There's a World Behind This Door.
                        </div>
                    </div>
                    <div className='flex flex-col gap-4'>
                        <p className='max-w-xl font-[Lekton] text-large lg:text-2xl'>
                            The definitive intelligence hub for the modern gold enthusiast. A fusion of live market data, an expert AI historian, and community-driven discovery.
                        </p>
                        <Button className='uppercase'>Explore the hub</Button>
                    </div>
                </div>
                <div className="absolute w-full h-full -z-10 top-0">
                    <div ref={container} className='w-full h-full overflow-hidden'>
                        <InteractiveGridPattern className="absolute inset-0 xl:left-1/2 xl:max-w-5xl h-full" width={gridSize} height={gridSize} />
                        <HeroAnim className="absolute w-[150%] xl:w-full h-full right-0 bottom-0 object-cover pointer-events-none" />
                    </div>
                </div>
            </div>
            <div className='relative w-full max-h-12 bg-foreground text-background text-nowrap items-center'>
                <Separator className="absolute top-0 text-background" />
                <Marquee className="[--duration:20s]" repeat={10}>
                    <div className='flex items-center gap-8'>
                        <span>AI-POWERED INSIGHTS</span>
                        <GoldNugget />
                        <span>LIVE MARKET DATA</span>
                        <GoldNugget />
                        <span>THE HISTORIAN AI</span>
                        <GoldNugget />
                        <span>COMMUNITY DISCOVERY</span>
                        <GoldNugget />
                        <span>THE RUSH IS LIVE</span>
                        <GoldNugget />
                        <span>STATUS IS EARNED, NOT BOUGHT</span>
                        <GoldNugget />
                    </div>
                </Marquee>
            </div>
        </section>
    )
}