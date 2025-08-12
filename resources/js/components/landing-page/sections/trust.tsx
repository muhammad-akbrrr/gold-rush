import { useEffect, useRef, useState } from "react";
import { InteractiveGridPattern } from "../../magicui/interactive-grid-pattern";
import { Separator } from "../../ui/separator"
import { TrustAnim } from "./trust/trust-anim";
import { useGSAP } from "@gsap/react";

import gsap from "gsap";
import { useIsMobile } from "@/hooks/use-mobile";

export const Trust = () => {
    const [gridSize, setGridSize] = useState<number>(0);
    const isMobile = useIsMobile();

    useEffect(() => {
        isMobile ? setGridSize(window.innerWidth / 5) : setGridSize(window.innerWidth / 12);
    }, [isMobile]);


    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const trustAnim = container.current?.querySelector('[data-gsap="trust-anim"]') || null;

        gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: isMobile ? "top top+=56rem" : "top top+=44rem",
                end: "bottom top",
                scrub: true,
                pin: true,
                pinSpacing: false,
                invalidateOnRefresh: true,
            }
        })

        gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: "top bottom",
                end: "top top+=44rem",
                scrub: true,
            }
        })
            .from(trustAnim, { yPercent: -100, ease: "none" })


    }, { scope: container });


    return (
        <section ref={container} className="h-screen w-full flex flex-col items-center bg-background overflow-hidden text-muted-foreground">
            <Separator className="grow-0" />
            <h2 className="mx-4 md:mx-12 text-3xl xl:text-8xl 2xl:text-9xl font-bold text-center uppercase my-4">
                Built on a foundation of trust
            </h2>
            <Separator className="grow-0" />
            <div className="relative h-full w-full px-4 md:px-12 pt-12 overflow-hidden">
                <InteractiveGridPattern width={gridSize} height={gridSize} className="w-full h-full" />
                <TrustAnim data-gsap="trust-anim" className="absolute left-0 -top-10 xl:top-0 w-full h-full xl:h-[50svh] xl:max-h-11/12 xl:-translate-x-[2.1%] touch-pan-y" />
            </div>
        </section>
    );
}