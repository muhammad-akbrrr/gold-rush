import { Separator } from "@/components/ui/separator"
import { Map } from "./live-operation/map"

import { useGSAP } from '@gsap/react';
import { useRef } from "react";
import gsap from 'gsap';
import ScrollTrigger from "gsap/ScrollTrigger";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

export const LiveOperation = () => {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const map = container.current?.querySelector('.map') as HTMLOrSVGElement | null;

        const ctx = gsap.context(() => {
            // Map axis
            gsap.timeline({
                scrollTrigger: {
                    trigger: container.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                },
                defaults: { ease: 'none' }
            })
                .fromTo(map, { yPercent: -100 }, { yPercent: 100 })

            // Main map animation
            gsap.timeline({
                scrollTrigger: {
                    trigger: container.current,
                    start: 'top bottom',
                    end: 'top top',
                    scrub: 1
                },
                defaults: { ease: 'none' }
            })
                .from('.map .dots path', {
                    autoAlpha: 0,
                    duration: 1,
                    stagger: {
                        from: 'random',
                        each: .05
                    }
                }, 0)


            // Paper animation
            gsap.timeline({
                scrollTrigger: {
                    trigger: container.current,
                    start: 'top bottom',
                    toggleActions: 'play none none reset'
                },
                defaults: { duration: 1, transformOrigin: 'bottom' }
            })
                .from('.paper-1', { autoAlpha: 0, rotate: -7 })
                .from('.paper-2', { autoAlpha: 0, rotate: 8 }, 0)
                .from('.map .strings path', { autoAlpha: 0, drawSVG: 0}, 0.1)
        }, container)


        return () => ctx.revert();
    }, { scope: container })

    return (
        <section className='flex flex-col min-h-svh relative z-0 overflow-hidden bg-background text-muted-foreground'>
            <Separator></Separator>
            <div className='flex-1 mx-auto flex flex-col lg:grid grid-cols-12'>
                <div className="col-span-4 flex flex-col gap-8 justify-between">
                    <div className="flex flex-col gap-4 ms-4 lg:ms-12 pe-4 pt-4 lg:pt-24">
                        <h2 className="text-3xl xl:text-6xl 2xl:text-8xl font-bold uppercase">The Live Operation</h2>
                        <span className="text-large lg:text-xl font-bold">This is where you go from spectator to prospector.</span>
                    </div>
                    <Separator></Separator>
                    <div className="flex-1 flex flex-col gap-4 justify-between ms-4 lg:ms-12 pe-4 text-xl">
                        <div className="flex flex-col gap-2">
                            <span className="lg:text-2xl font-bold uppercase">Analyze the Archives</span>
                            <p className="font-[Lekton]">We've digitized vast historical archives—maps, journals, and logs too nuanced for AI to decipher alone.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="lg:text-2xl font-bold uppercase">Lend Your Intuition</span>
                            <p className="font-[Lekton] ">Through 'Collective Sifting', you perform micro-tasks to find the patterns, names, and locations hidden within the noise.</p>
                        </div>
                        <div className="flex flex-col gap-2 mb-12">
                            <span className="lg:text-2xl font-bold uppercase">Evolve The Atlas</span>
                            <p className="font-[Lekton] ">Every validated discovery directly updates the Living Atlas, revealing new hot zones and guiding the entire community.</p>
                        </div>
                    </div>
                </div>
                <div ref={container} className="relative col-span-8 bg-foreground p-4 lg:p-24 flex items-center justify-center order-first lg:order-last overflow-hidden">
                    <InteractiveGridPattern className="map-grid w-full h-full absolute inset-0 m-auto opacity-20" squares={[48, 48]}/>
                    <Map className="map w-full h-auto m-auto pointer-events-none" />
                </div>
            </div>
            <Separator></Separator>
        </section>
    )
}