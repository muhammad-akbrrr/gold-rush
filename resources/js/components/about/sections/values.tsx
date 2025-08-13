import { Separator } from "@/components/ui/separator";
import { Title } from "./values/title";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function Values() {
    const container = useRef<HTMLDivElement | null>(null);

    useGSAP(() => {
        const value = container.current?.querySelectorAll('[data-gsap="value-container"]') || null;
        const title = container.current?.querySelector('[data-gsap="value-title"]') || null;
        const separatorHorizontal = container.current?.querySelectorAll('[data-gsap="separator-horizontal"]') || null;
        const separatorVertical = container.current?.querySelectorAll('[data-gsap="separator-vertical"]') || null;

        gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: true
            }
        })
            .from(value, {
                yPercent: -100,
                ease: "none",
                duration: 1
            })
    }, { scope: container });

    return (
        <section ref={container} className="relative w-full min-h-screen bg-background text-muted-foreground flex flex-col items-stretch overflow-hidden">
            <div className="relative bg-background z-10">
                <Separator className="mb-8" />
                <Title className="min-h-8 mx-12 mt-8" data-gsap="value-title" />
                <h2 className="sr-only">Values</h2>
                <Separator className="mt-8" />
            </div>
            <div className="relative flex-1 grid grid-cols-2 xl:text-xl 2xl:text-2xl font-[Lekton] leading-relaxed px-12 items-center" data-gsap="value-container">
                <Separator className="absolute inset-0 m-auto w-full"/>
                <Separator orientation="vertical" className="absolute inset-0 m-auto w-full"/>
                <svg className="absolute inset-0 m-auto w-full text-border" width="87" height="86" viewBox="0 0 87 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="43" cy="43" r="43" transform="matrix(-1 0 0 1 86 0)" fill="#EDF1FA" />
                    <circle cx="43" cy="43" r="42.5" transform="matrix(-1 0 0 1 86 0)" stroke="currentColor" />
                    <circle cx="10" cy="10" r="9.5" transform="matrix(-1 0 0 1 53 33)" stroke="currentColor" />
                </svg>
                <div className="p-12 space-y-8">
                    <div className="xl:text-5xl 2xl:text-6xl font-bold font-[Kode_Mono] leading-none">Community First</div>
                    <div>We believe in a transparent and collaborative ecosystem where every contributor's voice and effort are valued.</div>
                </div>
                <div className="p-12 space-y-8">
                    <div className="xl:text-5xl 2xl:text-6xl font-bold font-[Kode_Mono] leading-none">Community First</div>
                    <div>We believe in a transparent and collaborative ecosystem where every contributor's voice and effort are valued.</div>
                </div>
                <div className="p-12 space-y-8">
                    <div className="xl:text-5xl 2xl:text-6xl font-bold font-[Kode_Mono] leading-none">Community First</div>
                    <div>We believe in a transparent and collaborative ecosystem where every contributor's voice and effort are valued.</div>
                </div>
                <div className="p-12 space-y-8">
                    <div className="xl:text-5xl 2xl:text-6xl font-bold font-[Kode_Mono] leading-none">Community First</div>
                    <div>We believe in a transparent and collaborative ecosystem where every contributor's voice and effort are valued.</div>
                </div>
            </div>
        </section>
    )
}