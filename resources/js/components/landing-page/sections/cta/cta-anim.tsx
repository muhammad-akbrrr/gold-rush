import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import { cn } from '@/lib/utils';

interface CTAAnimProps {
    className?: string;
}

export const CTAAnim = ({className = ""}: CTAAnimProps) => {
    const { RiveComponent } = useRive({
        src: '/rive/cta.riv',
        stateMachines: "State Machine 1",
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