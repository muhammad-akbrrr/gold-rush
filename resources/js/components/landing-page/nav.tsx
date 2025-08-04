import { useIsMobile } from '@/hooks/use-mobile';
import { router } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { BrandLogo } from '../brand-logo';
import { Link } from '../link';
import { Separator } from '../ui/separator';
import { Button } from './button';

export function Nav() {
    return (
        <nav className="fixed z-50 flex min-w-screen justify-center bg-foreground py-1 text-background">
            <div className="mx-12 flex w-full items-center justify-between">
                <BrandLogo />
                {useIsMobile() ? (
                    <>
                        <Button variant="nav" onClick={() => router.visit(route('connect-wallet'))}>
                            <Menu />
                        </Button>
                    </>
                ) : (
                    <>
                        <ul className="flex flex-1 items-center justify-around gap-8">
                            <li>
                                <Link className="text-lg">About</Link>
                            </li>
                            <li>
                                <Link className="text-lg">Litepaper</Link>
                            </li>
                        </ul>
                        <Button variant="nav" onClick={() => router.visit(route('connect-wallet'))}>
                            CONNECT YOUR WALLET
                        </Button>
                    </>
                )}
            </div>
            <Separator className="absolute bottom-0" />
        </nav>
    );
}
