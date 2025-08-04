import { cn } from "@/lib/utils";
import gsap from "gsap";
import React from "react";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface LinkProps {
    children?: React.ReactNode;
    href?: string;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function Link(props: LinkProps) {
    const { children, href, className = "text-muted-foreground ", onClick } = props;

    const container = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const link = container.current?.querySelector('a') || null;
        const label = container.current?.querySelector('.label') || null;
        const labelPseudo = container.current?.querySelector('.label-pseudo') || null;

        const tl = gsap.timeline({ paused: true })
            .to(label, { scaleY: 0, transformOrigin: "top", x: 5 })
            .from(labelPseudo, { scaleY: 0, transformOrigin: "bottom", x: -5 }, 0);

        const handleEnter = () => tl.play();
        const handleLeave = () => tl.reverse();

        link?.addEventListener('mouseenter', handleEnter);
        link?.addEventListener('mouseleave', handleLeave);

        return () => {
            link?.removeEventListener('mouseenter', handleEnter);
            link?.removeEventListener('mouseleave', handleLeave);
        };

    }, { scope: container })

    return (
        <div ref={container} className={cn("overflow-hidden text-lg", className)}>
            <a href={href} className={"relative cursor-pointer"} onClick={onClick}>
                <div className="label relative">{children}</div>
                <div className="label-pseudo absolute left-0 top-1/2 -translate-y-1/2 h-auto">{children}</div>
            </a>
        </div>
    )
}