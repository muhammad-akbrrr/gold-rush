import { Separator } from "@/components/ui/separator";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";

export function Mission() {
    const container = useRef<HTMLDivElement | null>(null);

    useGSAP(() => {
        const cardContainer = container.current?.querySelectorAll('[data-gsap="card-container"]') || null;
        const card = container.current?.querySelectorAll('[data-gsap="card"]') || null;

        const mm = gsap.matchMedia()

        if (card && card.length > 1) {
            mm.add("(min-width: 480px)", () => {
                // desktop setup code here...
                gsap.set(card[0], { xPercent: 50 });
                gsap.set(card[1], { xPercent: -50 });
            });

            mm.add("(max-width: 479px)", () => {
                gsap.set(card[0], { yPercent: 50 });
                gsap.set(card[1], { yPercent: -50 });
            });
        }

        gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            }
        })
            .fromTo(cardContainer, { y: "-100vh" }, { y: "100vh", ease: "none", duration: 1 })
            .fromTo(card,
                { rotationY: -270, rotationX: -40, rotationZ: -45 },
                { rotationY: 180, rotationX: 40, rotationZ: 45, ease: "none", duration: 1 }, 0)
    }, { scope: container });

    return (
        <section ref={container} className="relative w-full min-h-screen bg-background text-muted-foreground flex flex-col md:flex-row items-stretch overflow-hidden">
            <h2 className="sr-only">Vision & Mission</h2>
            <Separator className="absolute left-0 top-0 w-full" />
            <div className="relative flex-1 flex flex-col gap-8 items-center justify-center px-12 bg-[#BFBFB8] mix-blend-exclusion overflow-hidden">
                <div className="absolute bottom-0 xl:bottom-auto xl:right-0 flex justify-center xl:justify-end" data-gsap="card-container">
                    <img className="w-1/2 xl:w-2/3" src="/images/card-vision.png" data-gsap="card" />
                </div>
                <div className="relative text-5xl xl:text-8xl font-bold text-black">Vision</div>
                <div className="relative text-lg xl:text-2xl 2xl:text-3xl font-[Lekton] text-center text-white mix-blend-difference">
                    Our mission is to empower a new generation of explorers. We believe that by transforming passive observers into active contributors, we can collectively identify patterns and opportunities that were once invisible.
                </div>
            </div>
            <Separator orientation="vertical" className="w-full" />
            <div className="relative flex-1 flex flex-col gap-8 items-center justify-center px-12 overflow-hidden">
                <div className="absolute top-0 xl:top-auto xl:left-0 flex justify-center xl:justify-start" data-gsap="card-container">
                    <img className="w-1/2 xl:w-2/3" src="/images/card-mission.png" data-gsap="card" />
                </div>
                <div className="relative text-5xl xl:text-8xl font-bold">Mission</div>
                <div className="relative text-lg xl:text-2xl 2xl:text-3xl font-[Lekton] text-center text-[#BFBFB8] mix-blend-exclusion">
                    Our mission is to empower a new generation of explorers. We believe that by transforming passive observers into active contributors, we can collectively identify patterns and opportunities that were once invisible.
                </div>
            </div>
            <Separator className="absolute left-0 bottom-0 w-full" />
        </section>
    );
}