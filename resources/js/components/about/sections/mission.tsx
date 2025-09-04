import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

export function Mission() {
    const isMobile = useIsMobile();
    const container = useRef<HTMLDivElement | null>(null);

    useGSAP(
        () => {
            const cardContainer = container.current?.querySelectorAll('[data-gsap="card-container"]') || null;
            const card = container.current?.querySelectorAll('[data-gsap="card"]') || null;

            if (!cardContainer || !card) return;
            const cardArray = Array.from(cardContainer);
            const mm = gsap.matchMedia();

            if (card && card.length > 1) {
                mm.add('(min-width: 768px)', () => {
                    gsap.set(cardArray[0], { xPercent: 38, yPercent: 0 });
                    gsap.set(cardArray[1], { xPercent: -38, yPercent: 0 });
                });

                mm.add('(max-width: 767px)', () => {
                    gsap.set(cardArray[0], { yPercent: 50, xPercent: 0 });
                    gsap.set(cardArray[1], { yPercent: -50, xPercent: 0 });
                });
            }

            gsap.timeline({
                scrollTrigger: {
                    trigger: container.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            })
                .fromTo(cardContainer, { y: '-100vh' }, { y: '100vh', ease: 'none', duration: 1 })
                .fromTo(
                    card,
                    { rotationY: -270, rotationX: -40, rotationZ: -45 },
                    { rotationY: 180, rotationX: 40, rotationZ: 45, ease: 'none', duration: 1 },
                    0,
                );
        },
        { scope: container, dependencies: [isMobile] },
    );

    return (
        <section
            ref={container}
            className="relative flex min-h-screen w-full flex-col items-stretch overflow-hidden bg-background text-muted-foreground md:flex-row"
        >
            <h2 className="sr-only">Vision & Mission</h2>
            <Separator className="absolute top-0 left-0 w-full" />
            <div className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden bg-[#BFBFB8] px-12 mix-blend-exclusion">
                <div className="absolute right-auto bottom-0 flex justify-center md:right-0 md:bottom-auto md:justify-end" data-gsap="card-container">
                    <img className="w-1/2 md:w-3/4" src="/images/card-vision.png" data-gsap="card" />
                </div>
                <div className="relative text-4xl font-bold text-black xl:text-6xl 2xl:text-8xl">Vision</div>
                <div className="relative text-center font-[Lekton] text-lg text-white mix-blend-difference md:text-xl 2xl:text-2xl">
                    To establish the premier intelligence and research platform of this cycle. We believe true edge comes from superior tools,
                    verifiable utility, and a deep commitment to quality, not from fleeting hype. Our vision is a community of skilled participants,
                    armed with institutional-grade instruments.
                </div>
            </div>
            <Separator orientation="vertical" className="w-full" />
            <div className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-12">
                <div className="absolute top-0 flex justify-center md:top-auto md:left-0 md:justify-start" data-gsap="card-container">
                    <img className="w-1/2 md:w-3/4" src="/images/card-mission.png" data-gsap="card" />
                </div>
                <div className="relative text-4xl font-bold xl:text-6xl 2xl:text-8xl">Mission</div>
                <div className="relative text-center font-[Lekton] text-lg text-white mix-blend-difference md:text-xl 2xl:text-2xl">
                    To build a durable, high-utility platform centered around the $GRUSH token. Our mission is to deliver focused, high-quality
                    information tools and a user experience defined by clarity, precision, and verifiable function.
                </div>
            </div>
            <Separator className="absolute bottom-0 left-0 w-full" />
        </section>
    );
}
