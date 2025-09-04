import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { Title } from './values/title';

export function Values() {
    const container = useRef<HTMLDivElement | null>(null);
    const isMobile = useIsMobile();

    useGSAP(
        () => {
            const value = container.current?.querySelectorAll('[data-gsap="value-container"]') || null;

            gsap.timeline({
                scrollTrigger: {
                    trigger: container.current,
                    start: 'top bottom',
                    end: 'bottom bottom',
                    scrub: true,
                },
            }).from(value, {
                yPercent: -100,
                ease: 'none',
                duration: 1,
            });
        },
        { scope: container },
    );

    return (
        <section
            ref={container}
            className="relative flex min-h-screen w-full flex-col items-stretch overflow-hidden bg-background text-muted-foreground"
        >
            <div className="relative z-10 bg-background">
                <Separator className="mb-8" />
                <Title className="mx-12 mt-8 min-h-8" data-gsap="value-title" />
                <h2 className="sr-only">Values</h2>
                <Separator className="mt-8" />
            </div>
            <div
                className="relative flex flex-1 flex-col items-center justify-center px-0 font-[Lekton] leading-relaxed lg:grid lg:grid-cols-2 lg:px-12 xl:text-xl 2xl:text-2xl"
                data-gsap="value-container"
            >
                {!isMobile && (
                    <>
                        <Separator className="absolute inset-0 m-auto w-full" />
                        <Separator orientation="vertical" className="absolute inset-0 m-auto w-full" />
                        <svg
                            className="absolute inset-0 m-auto w-full text-border"
                            width="87"
                            height="86"
                            viewBox="0 0 87 86"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="43" cy="43" r="43" transform="matrix(-1 0 0 1 86 0)" fill="#EDF1FA" />
                            <circle cx="43" cy="43" r="42.5" transform="matrix(-1 0 0 1 86 0)" stroke="currentColor" />
                            <circle cx="10" cy="10" r="9.5" transform="matrix(-1 0 0 1 53 33)" stroke="currentColor" />
                        </svg>
                    </>
                )}
                <div className="space-y-8 p-4 xl:p-12">
                    <div className="font-[Kode_Mono] text-2xl leading-none font-bold xl:text-4xl 2xl:text-5xl">Verifiable by Design</div>
                    <div>
                        Clarity is our foundation. The rules of the platform, the function of the token, and the results of any interaction are
                        designed to be clear and unambiguous. We believe trust is built on predictable, well-defined mechanics.
                    </div>
                </div>
                <div className="space-y-8 p-4 xl:p-12">
                    <div className="font-[Kode_Mono] text-2xl leading-none font-bold xl:text-4xl 2xl:text-5xl">Pure Utility</div>
                    <div>
                        $GRUSH is not a stock. It is a utility token — the key to the platform. Its purpose is singular: to enable access to the
                        tools, data, and community within our ecosystem.
                    </div>
                </div>
                <div className="space-y-8 p-4 xl:p-12">
                    <div className="font-[Kode_Mono] text-2xl leading-none font-bold xl:text-4xl 2xl:text-5xl">Built for Participants</div>
                    <div>
                        This platform is engineered for the active user — the researcher, the analyst, the strategist. It rewards engagement and
                        skill. The collective intelligence of our users is the true measure of the platform's strength.
                    </div>
                </div>
                <div className="space-y-8 p-4 xl:p-12">
                    <div className="font-[Kode_Mono] text-2xl leading-none font-bold xl:text-4xl 2xl:text-5xl">Sustainable by Design</div>
                    <div>
                        Every element of the platform is engineered for sustainability. The token's role is to fuel the utility of the tools. As the
                        platform's usefulness grows, so does the intrinsic purpose of the access key that unlocks it.
                    </div>
                </div>
            </div>
        </section>
    );
}
