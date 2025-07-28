import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import { cn } from '@/lib/utils';

interface HeroAnimProps {
    className: string;
}

export const HeroAnim = ({className = ""}: HeroAnimProps) => {
    const { RiveComponent } = useRive({
        src: '/rive/hero.riv',
        stateMachines: "state_machine",
        autoplay: true,
        layout: new Layout({
            fit: Fit.Contain,
            alignment: Alignment.BottomRight
        })
    });

    return (
        <RiveComponent
            className={cn("", className)}    
        />
    );
}