"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React from "react";

export default function PageTransition() {
    const overlayRef = React.useRef<HTMLDivElement>(null);
    const holeRef = React.useRef<SVGPathElement>(null);
    const windowHeight = window.innerHeight;

    useGSAP(() => {
        const hole = holeRef.current;
        if (!hole) return;

        gsap.set(hole, { transformOrigin: "50% 40%" });
        gsap.timeline()
            .fromTo(hole, {
                y: windowHeight/2 - hole.getBoundingClientRect().height/2,
                duration: 1
            }, {
                y: 0, delay: 1
            })
            .fromTo(hole, { scale: 2 }, { scale: 150, delay: .5 });
    }, []);

    return (
        <div
            className="fixed inset-0 z-[9999] bg-none pointer-events-none flex items-center justify-center"
            ref={overlayRef}
        >
            <div className="fixed inset-0 z-[9999] bg-none pointer-events-none flex items-center justify-center" ref={overlayRef}>
                <svg className="w-full h-full" viewBox="0 0 313 253" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <mask id="hole-mask" maskUnits="userSpaceOnUse">
                            <rect width="100%" height="100%" fill="white" />
                            <path className="text-black"
                                id="hole-path"
                                ref={holeRef}
                                d="M156.5 122C155.071 122 154 123.154 154 124.692C154 126.231 155.429 127.192 155.607 127.192C155.429 127.96 154.541 131.978 154.536 132H158.464C158.459 131.978 157.571 127.96 157.393 127.192C157.75 127.192 159 126.231 159 124.692C159 123.154 157.929 122 156.5 122Z"
                                fill="currentColor"
                            />
                        </mask>
                    </defs>
                    {/* Make rect fill the viewport, not 313×253 */}
                    <rect width="100%" height="100%" fill="var(--muted-foreground)" mask="url(#hole-mask)" />
                </svg>
            </div>
        </div>
    );
}
