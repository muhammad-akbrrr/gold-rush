'use client';

import { InteractiveGridPattern } from '@/components/magicui/interactive-grid-pattern';
import { Separator } from '@/components/ui/separator';

import { useEffect, useRef, useState } from 'react';
import { Crest } from './reputation/crest';

import { useIsMobile } from '@/hooks/use-mobile';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Lock } from './reputation/lock';
import { Megaphone } from './reputation/megaphone';

export const Reputation = () => {
    const isMobile = useIsMobile();
    const container = useRef<HTMLDivElement>(null);
    const [gridSize, setGridSize] = useState<number>(0);

    useEffect(() => {
        const handleResize = () => {
            setGridSize(window.innerWidth / 2 / 5);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    useGSAP(
        () => {
            const textWrapper = container.current?.querySelector('.text-wrapper') as HTMLDivElement;
            const bgLine = container.current?.querySelector('.bg-line');
            const labelWrappers = container.current?.querySelectorAll('.label-wrapper');

            gsap.timeline({
                scrollTrigger: {
                    trigger: container.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    pin: textWrapper,
                    scrub: true,
                },
                defaults: { ease: 'none' },
            }).from(bgLine ?? null, { scaleY: 0, transformOrigin: 'top', duration: 0 }, 0);

            labelWrappers?.forEach((label) => {
                gsap.timeline({
                    scrollTrigger: {
                        trigger: label,
                        start: 'top bottom',
                        toggleActions: 'play none none reset',
                    },
                }).from(label, { width: 0, autoAlpha: 0, delay: 0.5 });
            });
        },
        { scope: container },
    );

    return (
        <section ref={container} className="relative min-h-screen grid-cols-2 bg-background text-muted-foreground md:grid">
            <Separator className="absolute inset-0 z-20 mx-0" />
            <div className="flex flex-col">
                <div className="text-wrapper relative z-10 bg-background">
                    <h2 className="mx-4 py-4 text-3xl font-bold uppercase lg:text-5xl 2xl:mx-12 2xl:py-24 2xl:text-7xl">
                        Reputation is built on knowledge.
                    </h2>
                    <Separator />
                </div>
                <div className="relative h-full w-full overflow-hidden">
                    <InteractiveGridPattern width={gridSize} height={gridSize} className="absolute inset-0 mx-auto grid w-auto" />
                </div>
            </div>
            <>{!useIsMobile() && <Separator orientation="vertical" className="absolute top-1/2 left-1/2 z-10 -translate-1/2" />}</>
            {/* <Separator orientation="vertical" className="absolute left-1/2 top-1/2 -translate-1/2 z-10" /> */}
            <div className="relative mx-4 flex flex-col items-stretch gap-8 py-12 text-xl font-bold md:mx-12 2xl:text-3xl">
                <div className="bg-line absolute inset-0 m-auto h-[calc(100%-12rem)] w-[1px] bg-[#E3BE5F]"></div>
                <div className="relative flex flex-col items-center text-center">
                    <Crest className="size-24 2xl:size-56" />
                    <div className="flex justify-center gap-4 overflow-hidden">
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                        <div className="label-wrapper flex flex-col items-center bg-background">
                            <span>Greenhorn</span>
                        </div>
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                    </div>
                </div>
                <div className="relative flex flex-col items-center gap-4 self-start text-center">
                    <Megaphone className="size-24 2xl:size-56" />
                    <div className="flex justify-center gap-4 overflow-hidden">
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                        <div className="label-wrapper flex flex-col items-center bg-background">
                            <span>
                                Amplified
                                <br />
                                Influence
                            </span>
                        </div>
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                    </div>
                </div>
                <div className="relative flex flex-col items-center gap-4 self-end text-center">
                    <Lock className="size-24 2xl:size-56" />
                    <div className="flex justify-center gap-4 overflow-hidden">
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                        <div className="label-wrapper flex flex-col items-center bg-background">
                            <span>
                                Exclusive
                                <br />
                                Access
                            </span>
                        </div>
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                    </div>
                </div>
                <div className="relative flex flex-col items-center text-center">
                    <div className="flex justify-center gap-4 overflow-hidden">
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                        <div className="label-wrapper flex flex-col items-center bg-background">
                            <span>Veteran</span>
                        </div>
                        <Separator orientation="vertical" className="bg-[#E3BE5F]" />
                    </div>
                    <Crest variant="gold" className="size-48 2xl:size-96" />
                </div>
            </div>
        </section>
    );
};
