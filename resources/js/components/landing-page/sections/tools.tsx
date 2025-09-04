import { Grid } from '@/components/grid';
import { Separator } from '@/components/ui/separator';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import gsap from 'gsap';

export const Tools = () => {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const innerContainer = container.current?.querySelector('.cards-wrapper') as HTMLDivElement;
            const cards = container.current?.querySelectorAll('.card') as unknown as HTMLDivElement;
            const cardBacks = container.current?.querySelectorAll('.card-back') as unknown as HTMLDivElement;

            gsap.set(cards, {
                transformStyle: 'preserve-3d',
                transformPerspective: 1000,
            });

            gsap.set(cardBacks, {
                rotateY: -180,
            });

            gsap.timeline({
                scrollTrigger: {
                    trigger: innerContainer,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
                defaults: { ease: 'none' },
            })
                .fromTo(
                    cards,
                    {
                        yPercent: -150,
                    },
                    {
                        yPercent: 150,
                        duration: 1,
                    },
                    0,
                )
                .from(cards, { rotationY: 180, rotationZ: -45, duration: 0.5, stagger: 0.05 }, 0)
                .to(cards, { rotationY: -180, rotationZ: 45, duration: 0.5, stagger: 0.05 }, 0.5);
        },
        { scope: container },
    );

    return (
        <section ref={container} className="flex min-h-screen w-full flex-col justify-between bg-background text-muted-foreground">
            <div className="mt-12 flex flex-col">
                <Separator />
                <h2 className="my-6 text-center text-3xl font-bold uppercase xl:text-8xl 2xl:text-9xl">Tools for your hunt</h2>
                <Separator />
            </div>
            <div className="cards-wrapper relative grid flex-1 grid-cols-2 bg-background">
                <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden px-4 text-center">
                    <Grid variant="sparse" className="absolute inset-0 m-auto h-auto max-w-full" />
                    <div className="card absolute">
                        <img className="max-h-1/2 backface-hidden" src="/images/tools-key.png" />
                        <img className="card-back absolute top-0 left-0 backface-hidden" src="/images/card-back.png" />
                    </div>
                    <p className="relative text-xl font-bold text-background uppercase mix-blend-exclusion xl:text-4xl">Research Deeper.</p>
                    <p className="relative max-w-md text-background mix-blend-exclusion">
                        Use the Historian AI and our curated archives to build your thesis. Understand the history, analyze the players, and form your
                        own conclusions based on fundamental data.
                    </p>
                </div>
                <Separator orientation="vertical" className="absolute inset-0 m-auto h-full"></Separator>
                <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden px-4 text-center">
                    <Grid variant="sparse" className="absolute inset-0 m-auto h-auto max-w-full" />
                    <div className="card absolute">
                        <img className="max-h-1/2 backface-hidden" src="/images/tools-brain.png" />
                        <img className="card-back absolute top-0 left-0 backface-hidden" src="/images/card-back.png" />
                    </div>
                    <p className="relative text-xl font-bold text-background uppercase mix-blend-exclusion xl:text-4xl">Track the Action</p>
                    <p className="relative max-w-md text-background mix-blend-exclusion">
                        Monitor the map and the news feed to follow real-world developments as they happen. This platform is your lens into the
                        ongoing, global hunt for value.
                    </p>
                </div>
            </div>
        </section>
    );
};
