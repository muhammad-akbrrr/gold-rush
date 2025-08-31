import { cn } from "@/lib/utils";
import gsap from "gsap";
import React from "react";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface NavLinkProps {
    children?: React.ReactNode;
    href?: string;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    dataGsap?: string;
}

export function NavLink(props: NavLinkProps) {
    const { children, href, className = "text-muted-foreground ", onClick, dataGsap } = props;

    const container = React.useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const link = container.current?.querySelector('a');
        const label = container.current?.querySelector('.label');
        const labelPseudo = container.current?.querySelector('.label-pseudo');
        if (!link || !label || !labelPseudo) return;

        const tl = gsap.timeline({ paused: true })
            .to(label, { scaleY: 0, transformOrigin: "top", x: 5 })
            .from(labelPseudo, { scaleY: 0, transformOrigin: "bottom", x: -5 }, 0);

        const handleEnter = () => tl.play();
        const handleLeave = () => tl.reverse();

        container.current?.addEventListener('mouseenter', handleEnter);
        container.current?.addEventListener('mouseleave', handleLeave);

        return () => {
            container.current?.removeEventListener('mouseenter', handleEnter);
            container.current?.removeEventListener('mouseleave', handleLeave);
        };

    }, { scope: container })

    return (
        <div ref={container}>
            <a className={cn("overflow-hidden text-lg cursor-pointer", className)} data-gsap={dataGsap} href={href} onClick={onClick}>
                <div className={"relative"} >
                    <div className="label relative">{children}</div>
                    <div className="label-pseudo absolute left-0 top-1/2 -translate-y-1/2 h-auto">{children}</div>
                </div>
            </a>
        </div>
    )
}