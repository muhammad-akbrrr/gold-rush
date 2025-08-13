import React, { useEffect, useRef, useState } from "react";

import { Marquee } from "@/components/magicui/marquee";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { Button } from "@/components/ui/button";
import { GoldNugget } from "@/components/gold-nugget";
import { Separator } from "@/components/ui/separator";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useIsMobile } from "@/hooks/use-mobile";
import { Title } from "./hero/title";
import { HeroAnim } from "./hero/hero-anim";

gsap.registerPlugin(ScrollTrigger);

export const HeroSection = () => {

    const container = useRef<HTMLDivElement | null>(null);
    const [gridSize, setGridSize] = useState<number>(0);
    const isMobile = useIsMobile();

    useEffect(() => {
        setGridSize(window.innerWidth / (isMobile ? 5 : 12));
    }, [isMobile]);

    useGSAP(() => {
        const grid = container.current?.querySelector('[data-gsap="grid"]') || null;

        gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: 'bottom bottom',
                end: 'bottom top',
                scrub: true,
            }
        })
            .to(grid, {
                yPercent: 100,
                ease: "none"
            });

        // return () => {
        //     ScrollTrigger.getAll().forEach(st => st.kill());
        // };
    }, { scope: container })

    return (
        <section ref={container} className='flex flex-col min-h-svh relative z-0 overflow-hidden bg-background text-muted-foreground justify-between'>
            <InteractiveGridPattern data-gsap="grid" width={gridSize} height={gridSize} className="w-full h-full left-1/2" />
            <div className="relative pt-24 bg-background">
                <Title type="big" className="mx-12 text-muted-foreground" />
                <Separator className="mt-8" />
            </div>
            <div className="relative flex-1 grid grid-cols-2 items-center gap-4 pointer-events-none">
                <div className="ps-12 text-2xl leading-10 font-[Lekton]">
                    Blending the spirit of the historic gold rush with cutting-edge technology, Project Gold Rush is a pioneering platform. It’s a live operation where a global community works with AI to unearth value from both digital and real-world frontiers, redefining what it means to be a prospector.
                </div>
                <div className="relative w-full h-full pointer-events-none">
                    <HeroAnim className="absolute w-[80%] h-[calc(70svh)] -bottom-20 left-1/2 -translate-x-1/2 -scale-x-100 pointer-events-none" />
                </div>
            </div>
            <div className="relative pb-12 bg-background">
                <Separator className="mb-8" />
                <Title type="small" className="mx-12 text-muted-foreground" />
            </div>
        </section>
    )
}