import { useState, useEffect, useRef } from "react";
import { BrandName } from "./brand-name";
import { InteractiveGridPattern } from "./magicui/interactive-grid-pattern";
import { Separator } from "./ui/separator";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link } from "./link";
import { useIsMobile } from "@/hooks/use-mobile";

export const Footer = () => {
    const [gridSize, setGridSize] = useState<number>(0);
    const isMobile = useIsMobile();

    useEffect(() => {
        const handleResize = () => {
            setGridSize(window.innerWidth / (isMobile ? 6 : 12));
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isMobile]);

    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {

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
            defaults: { ease: 'none' }
        })
            .fromTo(grid, { yPercent: -150 }, { yPercent: 0 }, 0)

        gsap.timeline({
            scrollTrigger: {
                trigger: titleWrap,
                start: 'top bottom',
                end: 'bottom top+=44rem',
                scrub: true,
                // invalidateOnRefresh: true
            },
            defaults: { duration: 1 }
        })
            .fromTo(titleWrap, { height: 0 }, { height: 'auto' }, 0)
            .fromTo(title, { yPercent: -100 }, { yPercent: 0, duration: 1 }, 0)
            .fromTo(desc, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0)

    }, { scope: container, dependencies: [isMobile] })

    return (
        <footer ref={container} className="relative flex flex-col justify-between min-h-screen overflow-hidden text-muted-foreground">
            {/* <Grid className="absolute inset-0 m-auto w-full h-auto" /> */}
            <InteractiveGridPattern className="grid absolute inset-0 m-auto h-full w-auto xl:w-full" width={gridSize} height={gridSize} />
            <div className="relative flex flex-col gap-4 items-stretch bg-background">
                <Separator className="mb-16 xl:mb-24" />
                <div className="mx-4 xl:mx-12 title-wrap overflow-hidden">
                    <BrandName className="title" />
                </div>
                <p className="desc max-w-xl mx-4 xl:ms-12 font-bold text-base xl:text-xl">Project Gold Rush is a live, interactive platform for digital discovery.</p>
                <Separator />
            </div>
            <div className="relative grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 bg-background">
                <Separator className="absolute top-0" />
                <ul className="space-y-2 md:space-y-4 py-4 mx-4 xl:mx-12">
                    <li className="text-base xl:text-xl font-bold">Resources</li>
                    <li>
                        <Link className="text-sm xl:text-lg">Litepaper</Link>
                    </li>
                    <li>
                        <Link className="text-sm xl:text-lg">Roadmap</Link>
                    </li>
                    <li>
                        <Link className="text-sm xl:text-lg">Media Kit</Link>
                    </li>
                    <li>
                        <Link className="text-sm xl:text-lg">FAQ</Link>
                    </li>
                </ul>
                <ul className="space-y-2 md:space-y-4 py-4 mx-4 xl:mx-12">
                    <li className="text-base xl:text-xl font-bold">Community</li>
                    <li>
                        <Link className="text-sm xl:text-lg">Discord</Link>
                    </li>
                    <li>
                        <Link className="text-sm xl:text-lg">Twitter (X)</Link>
                    </li>
                    <li>
                        <Link className="text-sm xl:text-lg">Telegram</Link>
                    </li>
                    <li>
                        <Link className="text-sm xl:text-lg">Medium</Link>
                    </li>
                </ul>
                <ul className="space-y-2 md:space-y-4 py-4 mx-4 xl:mx-12">
                    <li className="text-base xl:text-xl font-bold">Legal</li>
                    <li>
                        <Link className="text-sm xl:text-lg">Privacy Policy</Link>
                    </li>
                    <li>
                        <Link className="text-sm xl:text-lg">Terms and Conditions</Link>
                    </li>
                    <li>
                        <Link className="text-sm xl:text-lg">Contact Us</Link>
                    </li>
                </ul>
                <Separator className="absolute bottom-0" />
            </div>
            <div className="relative py-4 bg-background text-center text-xs md:text-sm">
                <Separator className="absolute top-0" />
                © 2025 [Your Company Name]. A registered Swiss entity. All rights reserved.
            </div>
        </footer>
    )
}