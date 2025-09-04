import { useGSAP } from '@gsap/react';
import { useEffect, useRef, useState } from 'react';
import { Grid } from '../grid';
import { InteractiveGridPattern } from '../magicui/interactive-grid-pattern';
import { Separator } from '../ui/separator';
import { Button } from './button';
import { Input } from './input';
import { Corners } from './sections/cta/corners';
import { CTAAnim } from './sections/cta/cta-anim';

import { useIsMobile } from '@/hooks/use-mobile';
import gsap from 'gsap';

export const CTA = () => {
    const [gridSize, setGridSize] = useState<number>(0);

    useEffect(() => {
        const ctaCard = document.querySelector('.cta-card');

        if (!ctaCard) return;

        setGridSize(ctaCard.clientWidth / 3);
    }, []);

    const container = useRef<HTMLDivElement>(null);
    useGSAP(
        () => {
            const stick = container.current?.querySelectorAll('.stick') as unknown as HTMLDivElement;

            gsap.timeline({
                scrollTrigger: {
                    trigger: stick,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
                defaults: { ease: 'none' },
            }).from(stick, { y: -(container.current?.clientHeight || 0) });
        },
        { scope: container },
    );

    return (
        <section
            ref={container}
            className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background md:grid md:grid-cols-2"
        >
            <Separator className="absolute top-0" />
            {!useIsMobile() ? (
                <>
                    <div className="stick absolute bottom-0 w-full">
                        <Grid className="h-auto w-full" />
                    </div>
                </>
            ) : (
                <></>
            )}
            <div className="relative xl:p-12">
                <div
                    className={`cta-card relative flex h-screen w-full flex-col items-stretch justify-center gap-2 overflow-hidden bg-foreground p-8 text-background md:h-full xl:px-16 xl:py-10 2xl:p-24`}
                >
                    {!useIsMobile() ? (
                        <>
                            <Corners position="top left" />
                            <Corners position="top right" />
                            <Corners position="bottom left" />
                            <Corners position="bottom right" />
                        </>
                    ) : (
                        <></>
                    )}
                    <InteractiveGridPattern className="h-full opacity-15" width={gridSize} height={gridSize} />
                    <span className="relative">The frontier is opening</span>
                    <h2 className="relative mb-6 text-5xl font-bold uppercase xl:text-4xl 2xl:text-6xl">Join the waitlist</h2>
                    <p className="relative font-[Lekton] text-base xl:text-lg 2xl:text-xl">
                        The token is not yet public. This early cohort is for serious researchers. By joining the Founders List, you get
                        mission-critical updates and a head start. As a thank you for being early, all Founder wallets will receive our Genesis
                        Airdrop of Reputation Points (RP), instantly establishing your status in the community and kickstarting your legacy.
                    </p>
                    <div className="relative mt-8 space-y-4">
                        <Input className="max-h-12 xl:max-h-16" placeholder="Enter your email" />
                        <Button className="max-h-12 w-full px-4 text-base uppercase xl:max-h-16" variant="cta">
                            CLAIM MY FOUNDER STATUS
                        </Button>
                    </div>
                </div>
            </div>
            {!useIsMobile() ? (
                <>
                    <div className="stick relative flex h-full items-end justify-center px-12">
                        <CTAAnim className="h-full max-h-11/12 w-full" />
                    </div>
                </>
            ) : (
                <></>
            )}
            <Separator className="absolute bottom-0" />
        </section>
    );
};
