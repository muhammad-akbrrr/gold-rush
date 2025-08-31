import { useIsMobile } from '@/hooks/use-mobile';
import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowUpRight, ChevronDown, Menu } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { Button } from './landing-page/button';
import { NavLink } from './nav-link';
import { Separator } from './ui/separator';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePageExit } from '@/lib/use-page-exit';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

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
        // if (!isMobile) return; // skip if not mobile

        if (isMobile) {
            const navTrigger = container.current?.querySelector('[data-gsap="nav-trigger"]');
            const mobileNavContent = container.current?.querySelector('[data-gsap="mobile-nav-content"]');
            const btnBg = container.current?.querySelector('[data-gsap="btn-bg"]');
            const overlay = container.current?.querySelector('[data-gsap="overlay"]');
            const icon = container.current?.querySelector('[data-gsap="icon"]');

            if (!navTrigger || !mobileNavContent || !btnBg || !overlay || !icon) return;

            const mobileTl = gsap.timeline({ paused: true })
                .to(mobileNavContent, { x: 0 })
                .to(btnBg, { scaleY: 1 }, 0)
                .to(navTrigger, { borderColor: "var(--background)" }, 0)
                .to(icon, { color: "var(--background)" }, 0)
                .to(overlay, { autoAlpha: 1 }, 0)
                .reverse();
            const handleNav = () => {
                console.log('handleNav');
                if (!mobileTl) return;
                if (mobileTl.reversed()) {
                    mobileTl.play();
                } else {
                    mobileTl.reverse();
                }
            };

            navTrigger.addEventListener('click', handleNav);
            return () => {
                navTrigger.removeEventListener('click', handleNav);
            }
        } else {
            const navBrand = container.current?.querySelector('[data-gsap="nav-brand"]');
            const navBrandText = container.current?.querySelector('[data-gsap="nav-brand-text"]');
            const navLinks = container.current?.querySelector('[data-gsap="nav-link"]');
            // const navList = container.current?.querySelector('[data-gsap="nav-list"]');
            const navItems = Array.from(container.current?.querySelectorAll('[data-gsap="has-sub"]') || []);
            const chevron = navItems.map(item => item.querySelector('[data-gsap="has-sub-chevron"]'));
            const subItem = container.current?.querySelector('[data-gsap="sub-item"]');
            const subItemLinks = Array.from(subItem?.querySelectorAll('[data-gsap="sub-item-link"]') || []);
            if (!navBrand || !navBrandText || !navLinks || !subItem || !navItems || !chevron) return;

            gsap.set(subItem, { autoAlpha: 0 });

            const scrollTl = gsap.timeline({ paused: true })
                .to(navLinks, { yPercent: -100, autoAlpha: 0 }, 0)
            // .set(navList, { width: 0 });

            const collapse = gsap.timeline({ paused: true })
                .to(navBrandText, { autoAlpha: 0, width: 0 }, 0)
                .to(navBrand, { width: 32, gap: 0, padding: 0 }, 0)

            const st = ScrollTrigger.create({
                start: 0,
                end: 'max',
                onUpdate: (self) => {
                    if (self.direction === 1) {
                        scrollTl.play();
                    } else if (self.direction === -1) {
                        scrollTl.reverse();
                    }
                }
            });

            const brandST = ScrollTrigger.create({
                start: 0,
                end: 'max',
                onUpdate: (self) => {
                    if (window.scrollY > 24) {
                        collapse.play();
                    } else {
                        collapse.reverse();
                    }
                }
            });

            const hoverTimelines: gsap.core.Timeline[] = [];
            navItems.forEach((item, index) => {
                const tl = gsap.timeline({ paused: true, reversed: true })
                    .to(subItem, { autoAlpha: 1 }, 0)
                    .to(chevron[index], { rotate: 180 }, 0);

                hoverTimelines[index] = tl;

                item.addEventListener("mouseenter", () => {
                    hoverTimelines[index].play();
                });
                item.addEventListener("mouseleave", () => {
                    hoverTimelines[index].reverse();
                });
            });

            subItemLinks.forEach((item) => {
                const arrow = Array.from(item.querySelectorAll('[data-gsap="arrow"]') || []);
                if (!arrow) return;

                gsap.set(arrow[1], { xPercent: -100, yPercent: 100 });

                const tl = gsap.timeline({ paused: true, reversed: true })
                    .to(arrow[0], { xPercent: 100, yPercent: -100 }, 0)
                    .to(arrow[1], { xPercent: 0, yPercent: 0 }, 0)

                item.addEventListener("mouseenter", () => {
                    tl.play();
                });
                item.addEventListener("mouseleave", () => {
                    tl.reverse();
                });
            })

            return () => {
                st.kill();
                brandST.kill();
                scrollTl.kill();
                navItems.forEach((item, index) => {
                    item.removeEventListener("mouseenter", () => hoverTimelines[index].play());
                    item.removeEventListener("mouseleave", () => hoverTimelines[index].reverse());
                });
                subItemLinks.forEach((item, index) => {
                    item.removeEventListener("mouseenter", () => hoverTimelines[index].play());
                    item.removeEventListener("mouseleave", () => hoverTimelines[index].reverse());
                })
            };
        }
    }, { scope: container, dependencies: [isMobile] });

    const resources = ['Litepaper', 'Media Kit', 'Road Map']

    return (
        <nav ref={container} className='fixed z-50 left-0 top-0 px-0 pt-0 lg:px-12 lg:pt-4 min-w-full flex justify-between uppercase pointer-events-none'>
            {!isMobile ? (
                <>
                    <div className="w-auto flex items-stretch justify-between gap-[1px] pointer-events-auto">
                        <Link className='relative z-10 px-4 py-3 flex items-center bg-foreground' href={"#"}
                            onClick={() => {
                                if (component === "home") return;
                                pageExit(route('home'))
                            }}
                        >
                            <div className='flex gap-2 items-center h-8' data-gsap="nav-brand">
                                <BrandLogo className='min-h-8 min-w-8'/>
                                <div className='font-[Neo_Externo] text-background -mb-1 text-lg whitespace-nowrap' data-gsap="nav-brand-text">Gold Rush 2.0</div>
                            </div>
                        </Link>
                        <ul className='flex items-stretch gap-[1px] h-full' data-gsap="nav-link">
                            <li className='bg-foreground flex items-center'>
                                <NavLink className='text-background px-4 py-3 flex items-center text-sm'
                                    onClick={() => {
                                        if (component === "about") return;
                                        pageExit(route("about"))
                                    }}>
                                    About
                                </NavLink>
                            </li>
                            <li className='relative bg-foreground flex items-center' data-gsap="has-sub">
                                <div className='relative'>
                                    <NavLink className='text-background flex items-center text-sm ps-4 pe-10 py-3'>
                                        Resources
                                    </NavLink>
                                    <ChevronDown className='size-4 text-background absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'
                                        data-gsap="has-sub-chevron" />
                                </div>
                                <div className='absolute w-full left-0 bottom-0 translate-y-[calc(100%+1px)] text-background bg-foreground text-sm'
                                    data-gsap="sub-item"
                                >
                                    {resources.map((item) => (
                                        <div className='relative w-full flex items-center gap-2' data-gsap='sub-item-link'>
                                            <NavLink className='text-background flex items-center text-sm ps-4 pe-10 py-4'>
                                                {item}
                                            </NavLink>
                                            <div className='overflow-hidden absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                                                <ArrowUpRight className='size-4' data-gsap='arrow' />
                                                <ArrowUpRight className='size-4 absolute left-0 top-0' data-gsap='arrow' />
                                            </div>
                                        </div>
                                    ))}
                                    <div className='relative w-full flex items-center gap-2' data-gsap='sub-item-link'>
                                        <NavLink className='text-background flex items-center text-sm ps-4 pe-10 py-4'>
                                            FAQ
                                        </NavLink>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div>
                        {isAuthenticated && user ? (
                            <Button
                                variant="nav"
                                onClick={() => router.visit(route('dashboard'))}
                                disabled
                            >
                                GO TO DASHBOARD
                            </Button>
                        ) : (

                            <Button
                                variant="nav"
                                onClick={() => router.visit(route('web3.login.inertia'))}
                                disabled
                            >
                                CONNECT YOUR WALLET
                            </Button>
                        )

                        }
                    </div>
                </>
            ) : (
                <>
                    <div className="bg-foreground flex w-full items-center justify-between px-4 py-2 xl:mx-12">
                        <NavLink
                            onClick={() => {
                                if (component === "welcome") return;
                                pageExit(route("home"))
                            }}
                        >
                            <BrandLogo />
                        </NavLink>
                        <button data-gsap="nav-trigger" className='relative bg-background flex items-center justify-center px-3 py-2'>
                            <div data-gsap="btn-bg" className="absolute inset-0 m-auto origin-bottom scale-y-0 bg-foreground"></div>
                            <div className="relative overflow-hidden">
                                <div data-gsap="label">
                                    <Menu data-gsap="icon" className="text-foreground" />
                                </div>
                            </div>
                        </button>
                    </div>
                    <Separator className="absolute bottom-0" />
                    <div className="absolute top-0 -z-1 bg-black/20 w-full h-screen opacity-0 invisible" data-gsap="overlay" />
                    <div className="absolute top-0 right-0 -z-1 bg-foreground w-auto h-screen px-6 pt-20 pb-8 translate-x-full" data-gsap="mobile-nav-content">
                        <ul className="space-y-4">
                            <li className="text-4xl font-bold text-background font-[Neo_Externo]">
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
                                )}
                            </li>
                            <li>
                                <NavLink className="text-background" onClick={() => {
                                    if (component === "about") return;
                                    pageExit(route("about"))
                                }}>
                                    About
                                </NavLink>
                            </li>
                            <li>
                                <NavLink className="text-background text-xl">Resources</NavLink>
                            </li>
                        </ul>
                    </div>
                </>
            )
            }
        </nav >
    );
}
