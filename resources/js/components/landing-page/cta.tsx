import { useState, useEffect, useRef, use } from "react";
import { InteractiveGridPattern } from "../magicui/interactive-grid-pattern"
import { Separator } from "../ui/separator"
import { Button } from "./button"
import { Grid } from "../grid";
import { CTAAnim } from "./sections/cta/cta-anim";
import { Input } from "./input";
import { Corners } from "./sections/cta/corners";
import { useGSAP } from "@gsap/react";

import gsap from "gsap";
import { useIsMobile } from "@/hooks/use-mobile";

export const CTA = () => {
    const [gridSize, setGridSize] = useState<number>(0);

    useEffect(() => {
        const ctaCard = document.querySelector('.cta-card');

        if (!ctaCard) return;

        setGridSize(ctaCard.clientWidth / 3)
    }, []);

    const container = useRef<HTMLDivElement>(null);
    useGSAP(() => {
        const stick = container.current?.querySelectorAll('.stick') as unknown as HTMLDivElement;

        gsap.timeline({
            scrollTrigger: {
                trigger: stick,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
            defaults: { ease: 'none' }
        })
            .from(stick, { y: -(container.current?.clientHeight || 0) })
    }, { scope: container })

    return (
        <section ref={container} className="relative min-h-screen w-full flex flex-col md:grid md:grid-cols-2 items-center justify-center bg-background overflow-hidden" >
            <Separator className="absolute top-0" />
            {!useIsMobile() ?
                <>
                    <div className="stick absolute bottom-0 w-full">
                        <Grid className="w-full h-auto" />
                    </div>
                </> : <></>

            }
            <div className="relative xl:p-12">
                <div className="cta-card relative w-full h-screen md:h-full flex flex-col items-stretch justify-center gap-2 bg-foreground text-background p-8 xl:p-24 overflow-hidden">
                    {!useIsMobile() ?
                        <>
                            <Corners position="top left" />
                            <Corners position="top right" />
                            <Corners position="bottom left" />
                            <Corners position="bottom right" />
                        </> : <></>
                    }
                    <InteractiveGridPattern className="opacity-15 h-full" width={gridSize} height={gridSize} />
                    <span className="relative">The frontier is opening</span>
                    <h2 className="relative text-5xl xl:text-6xl uppercase font-bold mb-6">Join the waitlist</h2>
                    <p className="relative text-base xl:text-xl font-[Lekton]">
                        Phase 1 is launching soon. The only way in is with $GOLDTOKEN. Join the official waitlist to get mission-critical updates and direct alerts on how to acquire your license to prospect. As a thank you for being early, all waitlist members will be eligible for our Genesis Airdrop of their first Reputation Points (RP) to kickstart their legacy.
                    </p>
                    <div className="relative space-y-4 mt-8">
                        <Input className="max-h-12 xl:max-h-16" placeholder="Enter your email" />
                        <Button className="max-h-12 xl:max-h-16 uppercase w-full text-base px-4" variant="cta">CLAIM MY SEAT & FOUNDER'S RP</Button>
                    </div>
                </div>
            </div>
            {!useIsMobile() ?
                <>
                    <div className="stick relative h-full flex items-end justify-center px-12">
                        <CTAAnim className="w-full h-full max-h-11/12" />
                    </div>
                </> : <></>
            }
            <Separator className="absolute bottom-0" />
        </section>
    )
}