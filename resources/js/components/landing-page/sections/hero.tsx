import { useEffect, useRef, useState } from 'react';

import { GoldNugget } from '@/components/gold-nugget';
import { InteractiveGridPattern } from '@/components/magicui/interactive-grid-pattern';
import { Marquee } from '@/components/magicui/marquee';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Button } from '../button';
import { HeroAnim } from './hero/hero-anim';
import { HeroTitleSVG } from './hero/title';

gsap.registerPlugin(ScrollTrigger);

export const HeroSection = () => {
    const container = useRef(null);
    const [gridSize, setGridSize] = useState<number>(12);
    const isMobile = useIsMobile();

    useEffect(() => {
        const handleResize = () => {
            setGridSize(window.innerWidth / (isMobile ? 5 : 12));
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    useGSAP(
        () => {
            gsap.timeline({
                scrollTrigger: {
                    trigger: container.current,
                    start: 'bottom bottom',
                    end: 'bottom top',
                    scrub: true,
                    pin: true,
                    pinSpacing: false,
                },
            });
        },
        { scope: container },
    );

    return (
        <section className="relative z-0 flex min-h-svh flex-col overflow-hidden bg-background text-muted-foreground">
            <div className="flex-1 flex-col lg:grid lg:grid-cols-2">
                <div className="lg-mx-0 mx-4 flex flex-col justify-between gap-4 pt-24 pb-6 lg:ms-12">
                    <div className="flex flex-col gap-4 text-end">
                        <HeroTitleSVG />
                        <div className="text-xl font-bold lg:text-2xl">There's a World Behind This Door.</div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <p className="text-large max-w-xl font-[Lekton] lg:text-xl">
                            The great discoveries weren't accidents — they were the result of superior information, relentless research, and the
                            courage to act on a hidden signal. Gold Rush 2.0 is your new command center. We combine AI-driven research tools with
                            real-time data streams to give you the intelligence needed to see the field more clearly. We're built for those who do the
                            work.
                        </p>
                        <Button className="uppercase">Join the Founders</Button>
                    </div>
                </div>
                <div className="absolute top-0 -z-10 h-full w-full">
                    <div ref={container} className="h-full w-full overflow-hidden">
                        <InteractiveGridPattern className="absolute inset-0 h-full xl:left-1/2 xl:max-w-5xl" width={gridSize} height={gridSize} />
                        <HeroAnim className="pointer-events-none absolute right-0 bottom-0 h-full w-[150%] object-cover xl:w-full" />
                    </div>
                </div>
            </div>
            <div className="relative max-h-12 w-full items-center bg-foreground text-nowrap text-background">
                <Separator className="absolute top-0 text-background" />
                <Marquee className="[--duration:20s]" repeat={10}>
                    <div className="flex items-center gap-8">
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
    );
};
