import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import { cn } from '@/lib/utils';

interface HeroAnimProps {
    className: string;
}

export const HeroAnim = ({className = ""}: HeroAnimProps) => {
    const { RiveComponent } = useRive({
        src: '/rive/about-hero.riv',
        stateMachines: "State Machine 1",
        autoplay: true,
        layout: new Layout({
            fit: Fit.Cover,
            alignment: Alignment.Center
        })
    });

    return (
        <RiveComponent
            className={cn("w-full", className)}
        />
    );
}