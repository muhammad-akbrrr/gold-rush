import { useIsMobile } from '@/hooks/use-mobile';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { BrandName } from './brand-name';
import { InteractiveGridPattern } from './magicui/interactive-grid-pattern';
import { NavLink } from './nav-link';
import { Separator } from './ui/separator';

export const Footer = () => {
    const [gridSize, setGridSize] = useState<number>(0);
    const isMobile = useIsMobile();

    useEffect(() => {
        const handleResize = () => {
            setGridSize(window.innerWidth / (isMobile ? 6 : 12));
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    const container = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const section = container.current?.querySelector('section');
            const grid = container.current?.querySelector('.grid') || null;
            const titleWrap = container.current?.querySelector('.title-wrap') || null;
            const title = container.current?.querySelector('.title') || null;
            const desc = container.current?.querySelector('.desc') || null;

            gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom bottom',
                    scrub: true,
                    // invalidateOnRefresh: true
                },
                defaults: { ease: 'none' },
            }).fromTo(grid, { yPercent: -150 }, { yPercent: 0 }, 0);

            gsap.timeline({
                scrollTrigger: {
                    trigger: titleWrap,
                    start: 'top bottom',
                    end: 'bottom top+=44rem',
                    scrub: true,
                    // invalidateOnRefresh: true
                },
                defaults: { duration: 1 },
            })
                .fromTo(titleWrap, { height: 0 }, { height: 'auto' }, 0)
                .fromTo(title, { yPercent: -100 }, { yPercent: 0, duration: 1 }, 0)
                .fromTo(desc, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0);
        },
        { scope: container, dependencies: [isMobile] },
    );

    return (
        <footer ref={container} className="relative flex min-h-screen flex-col justify-between overflow-hidden text-muted-foreground">
            {/* <Grid className="absolute inset-0 m-auto w-full h-auto" /> */}
            <InteractiveGridPattern className="absolute inset-0 m-auto grid h-full w-auto xl:w-full" width={gridSize} height={gridSize} />
            <div className="relative flex flex-col items-stretch gap-4 bg-background">
                <Separator className="mb-16 xl:mb-24" />
                <div className="title-wrap mx-4 overflow-hidden xl:mx-12">
                    <BrandName className="title" />
                </div>
                <p className="desc mx-4 max-w-xl text-base font-bold xl:ms-12 xl:text-xl">The intelligence platform for digital discovery.</p>
                <Separator />
            </div>
            <div className="relative grid grid-cols-2 gap-2 bg-background md:grid-cols-3 md:gap-4">
                <Separator className="absolute top-0" />
                <ul className="mx-4 space-y-2 py-4 md:space-y-4 xl:mx-12">
                    <li className="text-base font-bold xl:text-xl">Resources</li>
                    <li>
                        <NavLink className="text-sm xl:text-lg">Litepaper</NavLink>
                    </li>
                    <li>
                        <NavLink className="text-sm xl:text-lg">Roadmap</NavLink>
                    </li>
                    <li>
                        <NavLink className="text-sm xl:text-lg">Media Kit</NavLink>
                    </li>
                    <li>
                        <NavLink className="text-sm xl:text-lg">FAQ</NavLink>
                    </li>
                </ul>
                <ul className="mx-4 space-y-2 py-4 md:space-y-4 xl:mx-12">
                    <li className="text-base font-bold xl:text-xl">Community</li>
                    <li>
                        <NavLink className="text-sm xl:text-lg">Discord</NavLink>
                    </li>
                    <li>
                        <NavLink className="text-sm xl:text-lg">Twitter (X)</NavLink>
                    </li>
                    <li>
                        <NavLink className="text-sm xl:text-lg">Telegram</NavLink>
                    </li>
                    <li>
                        <NavLink className="text-sm xl:text-lg">Medium</NavLink>
                    </li>
                </ul>
                <ul className="mx-4 space-y-2 py-4 md:space-y-4 xl:mx-12">
                    <li className="text-base font-bold xl:text-xl">Legal</li>
                    <li>
                        <NavLink className="text-sm xl:text-lg">Privacy Policy</NavLink>
                    </li>
                    <li>
                        <NavLink className="text-sm xl:text-lg">Terms and Conditions</NavLink>
                    </li>
                    <li>
                        <NavLink className="text-sm xl:text-lg">Contact Us</NavLink>
                    </li>
                </ul>
                <Separator className="absolute bottom-0" />
            </div>
            <div className="relative bg-background py-4 text-center text-xs md:text-sm">
                <Separator className="absolute top-0" />© 2025 Gold Rush Project. All rights reserved.
            </div>
        </footer>
    );
};
