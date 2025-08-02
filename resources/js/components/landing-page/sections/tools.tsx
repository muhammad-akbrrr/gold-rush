import { Grid } from "@/components/grid"
import { Separator } from "@/components/ui/separator"
import { useGSAP } from "@gsap/react";
import { useRef } from "react"

import gsap from "gsap";


export const Tools = () => {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const innerContainer = container.current?.querySelector('.cards-wrapper') as HTMLDivElement;
        const cards = container.current?.querySelectorAll('.card') as unknown as HTMLDivElement;
        const cardBacks = container.current?.querySelectorAll('.card-back') as unknown as HTMLDivElement;

        gsap.set(cards, {
            transformStyle: "preserve-3d",
            transformPerspective: 1000
        });

        gsap.set(cardBacks, {
            rotateY: -180
        })

        gsap.timeline({
            scrollTrigger: {
                trigger: innerContainer,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
            defaults: { ease: 'none' }
        })
            .fromTo(cards, { 
                yPercent: -150 
            }, { 
                yPercent: 150, 
                duration: 1 
            }, 0)
            .from(cards, { rotationY: 180, rotationZ: -45, duration: 0.5, stagger: .05 }, 0)
            .to(cards, { rotationY: -180, rotationZ: 45, duration: 0.5, stagger: .05 }, .5)
    }, { scope: container });

    return (
        <section ref={container} className="min-h-screen w-full bg-background text-muted-foreground flex flex-col justify-between">
            <div className="flex flex-col mt-12">
                <Separator />
                <h2 className="text-3xl xl:text-8xl 2xl:text-9xl font-bold uppercase text-center my-6">Tools for your hunt</h2>
                <Separator />
            </div>
            <div className="cards-wrapper relative flex-1 grid grid-cols-2 bg-background">
                <div className="relative flex flex-col items-center justify-center gap-4 px-4 text-center overflow-hidden">
                    <Grid variant="sparse" className="absolute inset-0 m-auto max-w-full h-auto" />
                    <div className="card absolute">
                        <img className="max-h-1/2 backface-hidden" src="/images/tools-key.png"/>
                        <img className="card-back absolute top-0 left-0 backface-hidden" src="/images/card-back.png"/>
                    </div>
                    <p className="relative text-xl xl:text-4xl font-bold uppercase mix-blend-exclusion text-background ">Analyze the Archives</p>
                    <p className="relative max-w-md mix-blend-exclusion text-background">We've digitized vast historical archives —maps, journals, and logs too nuanced for AI to decipher alone.</p>
                </div>
                <Separator orientation="vertical" className="absolute inset-0 m-auto h-full"></Separator>
                <div className="relative flex flex-col items-center justify-center gap-4 px-4 text-center overflow-hidden">
                    <Grid variant="sparse" className="absolute inset-0 m-auto max-w-full h-auto" />
                    <div className="card absolute">
                        <img className="max-h-1/2 backface-hidden" src="/images/tools-brain.png"/>
                        <img className="card-back absolute top-0 left-0 backface-hidden" src="/images/card-back.png"/>
                    </div>
                    <p className="relative text-xl xl:text-4xl font-bold uppercase mix-blend-exclusion text-background">Lend Your Intuition</p>
                    <p className="relative max-w-md mix-blend-exclusion text-background">Through 'Collective Sifting', you perform micro-tasks to find the patterns, names, and locations hidden within the noise.</p>
                </div>
            </div>
        </section>
    )
}