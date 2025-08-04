import { useEffect, useRef, useState } from "react";
import { InteractiveGridPattern } from "../magicui/interactive-grid-pattern";
import { Separator } from "../ui/separator"
import { TrustAnim } from "./sections/trust/trust-anim";
import { useGSAP } from "@gsap/react";

import gsap from "gsap";

export const Trust = () => {
    const [gridSize, setGridSize] = useState<number>(0);

    useEffect(() => {
        setGridSize(window.innerWidth / 12);
    }, []);


    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const trustAnim = container.current?.querySelector('[data-gsap="trust-anim"]') || null;

        gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: "top top+=44rem",
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
        <section ref={container} className="h-[150svh] w-full flex flex-col items-center bg-background overflow-hidden text-muted-foreground">
            <Separator className="grow-0" />
            <h2 className="mx-12 text-9xl font-bold text-center uppercase my-4">
                Built on a foundation of trust
            </h2>
            <Separator className="grow-0" />
            <div className="relative h-full w-full px-12 pt-12 overflow-hidden">
                <InteractiveGridPattern width={gridSize} height={gridSize} />
                <TrustAnim data-gsap="trust-anim" className="absolute w-full h-[50svh] max-h-11/12 -translate-x-[2.1%]" />
            </div>
        </section>
    );
}