import { useIsMobile } from '@/hooks/use-mobile';
import { router } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { Button } from './landing-page/button';
import { Link } from './link';
import { Separator } from './ui/separator';

export function Nav() {
    return (
        <nav className="fixed z-50 flex min-w-screen justify-center bg-foreground py-2 text-background">
            <div className="mx-4 flex w-full items-center justify-between xl:mx-12">
                <Link href="/">
                    <BrandLogo />
                </Link>
                {useIsMobile() ? (
                    <>
                        <Button variant="nav" onClick={() => router.visit('/')}>
                            <Menu />
                        </Button>
                    </>
                ) : (
                    <>
                        <ul className="flex flex-1 items-center justify-around gap-8 text-lg">
                            <li>
                                <Link className="text-background" href="/about">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link className="text-background">Resources</Link>
                            </li>
                        </ul>
                        <Button variant="nav">CONNECT YOUR WALLET</Button>
                    </>
                )}
            </div>
            <Separator className="absolute bottom-0" />
        </nav>
    );
}
