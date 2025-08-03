import { Alignment, Fit, Layout, useRive } from '@rive-app/react-webgl2';
import { cn } from '@/lib/utils';

interface TrustAnimProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const TrustAnim = ({ className = "", ...props }: TrustAnimProps) => {
  const { RiveComponent } = useRive({
    src: '/rive/trust.riv',
    stateMachines: "State Machine 1",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center
    })
  });

  return (
    <div className={cn("", className)} {...props}>
      <RiveComponent />
    </div>
  );
};
