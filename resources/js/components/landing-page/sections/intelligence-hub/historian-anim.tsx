import {
    Alignment,
    Fit,
    Layout,
    useRive,
    useStateMachineInput,
} from '@rive-app/react-canvas';
import { cn } from '@/lib/utils';
import { forwardRef, useImperativeHandle } from 'react';

interface HistorianAnimProps {
    className?: string;
}

export interface HistorianAnimRef {
    fireTrigger: (index: number) => void;
}

const HistorianAnim = forwardRef<HistorianAnimRef, HistorianAnimProps>(({ className }, ref) => {
    const STATE_MACHINE = 'State Machine 1';

    const { rive, RiveComponent } = useRive({
        src: '/rive/historian.riv',
        stateMachines: STATE_MACHINE,
        autoplay: true,
        layout: new Layout({
            fit: Fit.Contain,
            alignment: Alignment.Center,
        }),
    });

    const triggerA = useStateMachineInput(rive, STATE_MACHINE, 'book');
    const triggerB = useStateMachineInput(rive, STATE_MACHINE, 'ticker');
    const triggerC = useStateMachineInput(rive, STATE_MACHINE, 'globe');

    useImperativeHandle(ref, () => ({
        fireTrigger: (index: number) => {
            const triggers = [triggerA, triggerB, triggerC];
            const trigger = triggers[index];
            trigger?.fire();
        }
    }));

    return <RiveComponent className={cn('', className)} />;
}
);

export default HistorianAnim;
