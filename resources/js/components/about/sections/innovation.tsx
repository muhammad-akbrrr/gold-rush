import { Grid } from '@/components/grid';
import { Separator } from '@/components/ui/separator';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';
import gsap from 'gsap';

export function Innovation() {
    const container = useRef<HTMLDivElement | null>(null);
    const isMobile = useIsMobile();

    useGSAP(
        () => {
            const grid = container.current?.querySelector('[data-gsap="grid"]') || null;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            });
            if (!isMobile) {
                tl.fromTo(grid, { yPercent: -100, scale: 2 }, { yPercent: 100, scale: 1, ease: 'none' });
            }
        },
        { scope: container, dependencies: [isMobile] },
    );

    return (
        <section
            ref={container}
            className="relative flex min-h-screen w-full flex-col items-stretch overflow-hidden bg-background text-muted-foreground md:grid md:grid-cols-2"
        >
            <Separator className="absolute top-0 left-0 w-full" />
            <div className="order-last flex flex-1 flex-col justify-start gap-8 p-4 xl:justify-center xl:px-12">
                <h2 className="text-4xl font-bold uppercase xl:text-6xl 2xl:text-8xl">A SWISS DESIGN ETHOS</h2>
                <div className="font-[Lekton] text-lg leading-relaxed xl:text-xl 2xl:text-2xl">
                    The Gold Rush project is designed with a philosophy rooted in Swiss principles: precision, reliability, and a focus on long-term
                    utility. Our team's approach is informed by decades of experience in disciplined market analysis and product development. Our
                    commitment is to building a durable platform where quality of information and user experience are paramount.
                </div>
            </div>
            <Separator
                className={isMobile ? 'order-1 w-full' : 'absolute inset-0 m-auto h-full'}
                orientation={isMobile ? 'horizontal' : 'vertical'}
            />
            <div data-gsap="grid-container" className="relative flex-1 overflow-hidden border-l border-border bg-background">
                <div className="absolute h-full w-full">
                    <Grid className="h-auto w-full" variant="swiss" />
                </div>
            </div>
        </section>
    );
}
