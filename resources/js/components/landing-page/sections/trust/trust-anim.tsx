import { Alignment, Fit, Layout, useRive } from '@rive-app/react-webgl2';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { use, useEffect, useState } from 'react';

interface TrustAnimProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const TrustAnim = ({ className = "", ...props }: TrustAnimProps) => {
  const isMobile = useIsMobile();
  const [source, setSource] = useState('/rive/trust.riv');

  useEffect(() => {
    if (isMobile) {
      setSource('/rive/trust-mobile.riv');
    } else {
      setSource('/rive/trust.riv');
    }
  }, [isMobile]);

  const { RiveComponent, rive } = useRive({
    src: source,
    stateMachines: "State Machine 1",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center
    })
  });

  useEffect(() => {
    const handleResize = () => {
      if (rive) {
        rive?.resizeDrawingSurfaceToCanvas();
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [rive]);


  return (
    <div className={cn("", className)} {...props}>
      <RiveComponent key={source} className='rive-container w-full h-full' />
    </div>
  );
};
