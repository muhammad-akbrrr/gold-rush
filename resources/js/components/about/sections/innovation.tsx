import { Grid } from "@/components/grid";
import { Separator } from "@/components/ui/separator";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import gsap from "gsap";

export function Innovation() {

    const container = useRef<HTMLDivElement | null>(null);

    useGSAP(() => {
        const grid = container.current?.querySelector('[data-gsap="grid"]') || null;

        gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            }
        })  
            .fromTo(grid, { yPercent: -100, scale: 2 }, { yPercent: 100, scale: 1, ease: "none"});

    }, { scope: container })

    return (
        <section ref={container} className="relative w-full min-h-screen bg-background text-muted-foreground grid grid-cols-2 items-stretch overflow-hidden">
            <Separator className="absolute left-0 top-0 w-full" />
            <div className="flex-1 flex flex-col gap-8 px-12 justify-center">
                <h2 className="xl:text-8xl 2xl:text-9xl uppercase font-bold">A Swiss Innovation</h2>
                <div className="xl:text-xl 2xl:text-2xl font-[Lekton] leading-relaxed">
                    Project Gold Rush was founded by [Your Company Name], a registered Swiss entity. Our international team is a collective of engineers, designers, and data scientists united by a passion for community, innovation, and decentralized technology. We are inspired by the idea that human collaboration, when amplified by advanced tools, can solve complex challenges and create tangible, real-world value.
                </div>
            </div>
            <div data-gsap="grid-container" className="relative flex-1 overflow-hidden border-l border-border bg-background">
                <Grid className="absolute w-full h-auto left-[calc(50%-1px)] top-1/2 -translate-1/2" variant="swiss" />
            </div>
        </section>
    )
}