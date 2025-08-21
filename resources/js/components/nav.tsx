import { useIsMobile } from '@/hooks/use-mobile';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import { router, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { Button } from './landing-page/button';
import { Link } from './link';
import { Separator } from './ui/separator';

interface PageProps extends InertiaPageProps {
    auth?: {
        web3?: {
            isAuthenticated: boolean;
            user?: {
                walletAddress: string;
                displayName?: string;
            };
        };
    };
}

export function Nav() {
    const { auth } = usePage<PageProps>().props;
    const isMobile = useIsMobile();
    const isAuthenticated = auth?.web3?.isAuthenticated || false;
    const user = auth?.web3?.user;

    return (
        <nav className="fixed z-50 flex min-w-screen justify-center bg-foreground py-2 text-background">
            <div className="mx-4 flex w-full items-center justify-between xl:mx-12">
                <Link href="/">
                    <BrandLogo />
                </Link>
                {isMobile ? (
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

                        {isAuthenticated && user ? (
                            <Button variant="nav" onClick={() => router.visit(route('dashboard'))}>
                                GO TO DASHBOARD
                            </Button>
                        ) : (
                            <Button variant="nav" onClick={() => router.visit(route('web3.login.inertia'))}>
                                CONNECT YOUR WALLET
                            </Button>
                        )}
                    </>
                )}
            </div>
            <Separator className="absolute bottom-0" />
        </nav>
    );
}
