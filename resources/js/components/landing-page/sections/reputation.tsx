"use client";

import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { Separator } from "@/components/ui/separator";

import { Crest } from "./reputation/crest";
import { useEffect, useRef, useState } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Megaphone } from "./reputation/megaphone";
import { Lock } from "./reputation/lock";
import { useIsMobile } from "@/hooks/use-mobile";

export const Reputation = () => {

    const container = useRef<HTMLDivElement>(null);
    const [gridSize, setGridSize] = useState<number>(0);

    useEffect(() => {
        setGridSize(window.innerWidth / 2 / 5)
    }, [])

    useGSAP(() => {
        const textWrapper = container.current?.querySelector('.text-wrapper') as HTMLDivElement;
        const bgLine = container.current?.querySelector('.bg-line');
        const labelWrappers = container.current?.querySelectorAll('.label-wrapper');

        gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: 'top top',
                end: 'bottom bottom',
                pin: textWrapper,
                scrub: true
            },
            defaults: { ease: 'none' }
        })
            .from(bgLine ?? null, { scaleY: 0, transformOrigin: "top", duration: 0 }, 0)

        labelWrappers?.forEach((label) => {
            gsap.timeline({
                scrollTrigger: {
                    trigger: label,
                    start: 'top bottom',
                    toggleActions: 'play none none reset'
                }
            })
                .from(label, { width: 0, autoAlpha: 0, delay: .5 })
        });
    }, { scope: container })

    return (
        <section ref={container} className="relative min-h-screen md:grid grid-cols-2 bg-background text-muted-foreground">
            <Separator className="absolute inset-0 mx-0 z-20" />
            <div className="flex flex-col">
                <div className="relative text-wrapper z-10 bg-background">
                    <h2 className="text-3xl lg:text-5xl 2xl:text-7xl font-bold uppercase mx-4 2xl:mx-12 py-4 2xl:py-24">Reputation isn't just a number. It's your influence</h2>
                    <Separator />
                </div>
                <div className="relative h-full w-full overflow-hidden">
                    <InteractiveGridPattern width={gridSize} height={gridSize} className="grid w-auto absolute inset-0 mx-auto" />
                </div>
            </div>
            <>
                {
                    !useIsMobile() && (<Separator orientation="vertical" className="absolute left-1/2 top-1/2 -translate-1/2 z-10" />)
                }
            </>
            {/* <Separator orientation="vertical" className="absolute left-1/2 top-1/2 -translate-1/2 z-10" /> */}
            <div className="relative flex flex-col items-stretch gap-8 text-xl 2xl:text-3xl font-bold mx-4 md:mx-12 py-12">
                <div className="bg-line absolute inset-0 m-auto w-[1px] h-[calc(100%-12rem)] bg-[#E3BE5F]"></div>
                <div className="relative flex flex-col items-center text-center">
                    <Crest className="size-24 2xl:size-56" />
                    <div className="flex justify-center gap-4 overflow-hidden">
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                        <div className="label-wrapper bg-background flex flex-col items-center">
                            <span>Greenhorn</span>
                        </div>
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                    </div>
                </div>
                <div className="relative flex flex-col self-start items-center text-center gap-4">
                    <Megaphone className="size-24 2xl:size-56" />
                    <div className="flex justify-center gap-4 overflow-hidden">
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                        <div className="label-wrapper bg-background flex flex-col items-center">
                            <span>Amplified<br />Influence</span>
                        </div>
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                    </div>
                </div>
                <div className="relative flex flex-col self-end items-center text-center gap-4">
                    <Lock className="size-24 2xl:size-56" />
                    <div className="flex justify-center gap-4 overflow-hidden">
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                        <div className="label-wrapper bg-background flex flex-col items-center">
                            <span>Exclusive<br />Access</span>
                        </div>
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                    </div>
                </div>
                <div className="relative flex flex-col items-center text-center">
                    <div className="flex justify-center gap-4 overflow-hidden">
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                        <div className="label-wrapper bg-background flex flex-col items-center">
                            <span>Veteran</span>
                        </div>
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                    </div>
                    <Crest variant="gold" className="size-48 2xl:size-96" />
                </div>
            </div>
        </section>
    )
}