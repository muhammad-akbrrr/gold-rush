import { Alignment, Fit, Layout, useRive } from '@rive-app/react-webgl2';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TrustAnimProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const TrustAnim = ({ className = "", ...props }: TrustAnimProps) => {
  const { RiveComponent } = useRive({
    src: useIsMobile() ? '/rive/trust-mobile.riv' : '/rive/trust.riv',
    stateMachines: "State Machine 1",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center
    })
  });

  return (
    <div className={cn("", className)} {...props}>
      <RiveComponent className='rive-container w-full h-full' />
    </div>
  );
};
