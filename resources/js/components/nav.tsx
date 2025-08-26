import { useIsMobile } from '@/hooks/use-mobile';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import { router, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { Button } from './landing-page/button';
import { Link } from './link';
import { Separator } from './ui/separator';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePageExit } from '@/lib/use-page-exit';
import { cn } from '@/lib/utils';

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
    const { component } = usePage();
    const isMobile = useIsMobile();
    const isAuthenticated = auth?.web3?.isAuthenticated || false;
    const user = auth?.web3?.user;
    const pageExit = usePageExit();

    const container = useRef<HTMLDivElement>(null);
    const timeline = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        if (!isMobile) return; // skip if not mobile

        const navTrigger = container.current?.querySelector('[data-gsap="nav-trigger"]');
        const mobileNavContent = container.current?.querySelector('[data-gsap="mobile-nav-content"]');
        const btnBg = container.current?.querySelector('[data-gsap="btn-bg"]');
        const overlay = container.current?.querySelector('[data-gsap="overlay"]');
        const icon = container.current?.querySelector('[data-gsap="icon"]');

        if (!navTrigger || !mobileNavContent || !btnBg || !overlay || !icon) return;

        timeline.current = gsap.timeline({ paused: true })
            .to(mobileNavContent, { x: 0 })
            .to(btnBg, { scaleY: 1 }, 0)
            .to(navTrigger, { borderColor: "var(--background)" }, 0)
            .to(icon, { color: "var(--background)" }, 0)
            .to(overlay, { autoAlpha: 1 }, 0)
            .reverse();

        // .to('html', { overflow: 'hidden', height: '100vh' }, 0);

        const handleNav = () => {
            console.log('handleNav');
            if (!timeline.current) return;
            if (timeline.current.reversed()) {
                timeline.current.play();
            } else {
                timeline.current.reverse();
            }
        };

        navTrigger.addEventListener('click', handleNav);
        return () => navTrigger.removeEventListener('click', handleNav);
    }, { scope: container, dependencies: [isMobile] });

    return (
        <nav ref={container} className="fixed z-50 flex min-w-screen justify-center bg-foreground text-background">
            <div className="bg-foreground mx-4 flex w-full items-center justify-between py-2 xl:mx-12">
                <Link onClick={() => {
                    if (component === "welcome") return;
                    pageExit(route("home"))
                }}>
                    <BrandLogo />
                </Link>
                {isMobile ? (
                    <>
                        <button data-gsap="nav-trigger" className='relative bg-background flex items-center justify-center px-3 py-2'>
                            <div data-gsap="btn-bg" className="absolute inset-0 m-auto origin-bottom scale-y-0 bg-foreground"></div>
                            <div className="relative overflow-hidden">
                                <div data-gsap="label">
                                    <Menu data-gsap="icon" className="text-foreground" />
                                </div>
                            </div>
                        </button>
                    </>
                ) : (
                    <>
                        <ul className="flex flex-1 items-center justify-around gap-8 text-lg">
                            <li>
                                <Link
                                    className={cn("text-background", { "font-bold": component === "about" })}
                                    onClick={() => {
                                        if (component === "about") return;
                                        pageExit(route("about"))
                                    }}>
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
            {isMobile &&
                <>
                    <div className="absolute top-0 -z-1 bg-black/20 w-full h-screen opacity-0 invisible" data-gsap="overlay" />
                    <div className="absolute top-0 right-0 -z-1 bg-foreground w-auto h-screen px-6 pt-20 pb-8 translate-x-full" data-gsap="mobile-nav-content">
                        <ul className="space-y-4">
                            <li className="text-4xl font-bold">
                                GOLD RUSH 2.0
                            </li>
                            <Separator />
                            <li className='w-full'>
                                {isAuthenticated && user ? (
                                    <Button className='w-full flex items-center uppercase max-w-full' onClick={() => router.visit(route('dashboard'))}>
                                        Go to dashboard
                                    </Button>
                                ) : (
                                    <Button className='w-full flex items-center uppercase max-w-full' onClick={() => router.visit(route('web3.login.inertia'))}>
                                        Connect your wallet
                                    </Button>
                                )
                                }
                            </li>
                            <li>
                                <Link className="text-background" onClick={() => {
                                    if (component === "about") return;
                                    pageExit(route("about"))
                                }}>
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link className="text-background text-xl">Resources</Link>
                            </li>
                        </ul>
                    </div>
                </>
            }
        </nav>
    );
}
