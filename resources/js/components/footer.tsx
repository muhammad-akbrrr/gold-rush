import { useState, useEffect, useRef } from "react";
import { BrandName } from "./brand-name";
import { Grid } from "./grid";
import { InteractiveGridPattern } from "./magicui/interactive-grid-pattern";
import { Separator } from "./ui/separator";
import { useGSAP } from "@gsap/react";

import gsap from "gsap";
import { Link } from "./link";

export const Footer = () => {
    const [gridSize, setGridSize] = useState<number>(0);

    useEffect(() => {
        setGridSize(window.innerWidth / 12)
    }, [])

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
                scrub: true
            },
            defaults: { ease: 'none' }
        })
            .from(grid, { yPercent: -150 })

        gsap.timeline({
            scrollTrigger: {
                trigger: titleWrap,
                start: 'top bottom',
                end: 'bottom top',
                // toggleActions: 'play none none reverse',
                scrub: true
            },
            defaults: { duration: 1 }
        })
            .from(titleWrap, { height: 0 })
            .from(title, { yPercent: -100, duration: 1 }, 0)
            .from(desc, { autoAlpha: 0, duration: 1 }, 0)

    }, { scope: container })

    return (
        <footer ref={container} className="relative flex flex-col justify-between min-h-screen overflow-hidden text-muted-foreground">
            {/* <Grid className="absolute inset-0 m-auto w-full h-auto" /> */}
            <InteractiveGridPattern className="grid absolute inset-0 m-auto w-full h-auto" width={gridSize} height={gridSize} />
            <div className="relative flex flex-col gap-4 items-stretch bg-background">
                <Separator className="mb-24" />
                <div className="title-wrap overflow-hidden">
                    <BrandName className="title" />
                </div>
                <p className="desc max-w-xl ms-12 font-bold text-xl">Project Gold Rush is a live, interactive platform for digital discovery.</p>
                <Separator />
            </div>
            <div className="relative grid grid-cols-3 gap-4 bg-background">
                <Separator className="absolute top-0" />
                <ul className="space-y-4 py-4 mx-12">
                    <li className="text-xl font-bold">Resources</li>
                    <li>
                        <Link>Litepaper</Link>
                    </li>
                    <li>
                        <Link>Roadmap</Link>
                    </li>
                    <li>
                        <Link>Media Kit</Link>
                    </li>
                    <li>
                        <Link>FAQ</Link>
                    </li>
                </ul>
                <ul className="space-y-4 py-4 mx-12">
                    <li className="text-xl font-bold">Community</li>
                    <li>
                        <Link>Discord</Link>
                    </li>
                    <li>
                        <Link>Twitter (X)</Link>
                    </li>
                    <li>
                        <Link>Telegram</Link>
                    </li>
                    <li>
                        <Link>Medium</Link>
                    </li>
                </ul>
                <ul className="space-y-4 py-4 mx-12">
                    <li className="text-xl font-bold">Legal</li>
                    <li>
                        <Link>Privacy Policy</Link>
                    </li>
                    <li>
                        <Link>Terms and Conditions</Link>
                    </li>
                    <li>
                        <Link>Contact Us</Link>
                    </li>
                </ul>
                <Separator className="absolute bottom-0" />
            </div>
            <div className="relative py-4 bg-background text-center">
                <Separator className="absolute top-0" />
                © 2025 [Your Company Name]. A registered Swiss entity. All rights reserved.
            </div>
        </footer>
    )
}