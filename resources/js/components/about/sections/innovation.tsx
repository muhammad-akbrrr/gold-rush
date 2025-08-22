import { Grid } from "@/components/grid";
import { Separator } from "@/components/ui/separator";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import gsap from "gsap";
import { useIsMobile } from "@/hooks/use-mobile";

export function Innovation() {

    const container = useRef<HTMLDivElement | null>(null);
    const isMobile = useIsMobile();

    useGSAP(() => {
        const grid = container.current?.querySelector('[data-gsap="grid"]') || null;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            }
        })
        if (!isMobile) {
            tl.fromTo(grid, { yPercent: -100, scale: 2 }, { yPercent: 100, scale: 1, ease: "none" });
        }

    }, { scope: container })

    return (
        <section ref={container}
            className="relative w-full min-h-screen bg-background text-muted-foreground flex flex-col md:grid md:grid-cols-2 items-stretch overflow-hidden"
        >
            <Separator className="absolute left-0 top-0 w-full" />
            <div className="order-last flex-1 flex flex-col gap-8 p-4 xl:px-12 justify-start xl:justify-center">
                <h2 className="text-5xl xl:text-8xl 2xl:text-9xl uppercase font-bold">A Swiss Innovation</h2>
                <div className="text-lg xl:text-xl 2xl:text-2xl font-[Lekton] leading-relaxed">
                    Project Gold Rush was founded by [Your Company Name], a registered Swiss entity. Our international team is a collective of engineers, designers, and data scientists united by a passion for community, innovation, and decentralized technology. We are inspired by the idea that human collaboration, when amplified by advanced tools, can solve complex challenges and create tangible, real-world value.
                </div>
            </div>
            <Separator className={ isMobile ? "w-full order-1" : "absolute h-full inset-0 m-auto" }
                orientation={isMobile ? "horizontal" : "vertical"}
            />
            <div data-gsap="grid-container" className="relative flex-1 overflow-hidden border-l border-border bg-background">
                <Grid className="absolute w-full h-auto left-[calc(50%-1px)] top-1/2 -translate-1/2" variant="swiss" />
            </div>
        </section>
    )
}