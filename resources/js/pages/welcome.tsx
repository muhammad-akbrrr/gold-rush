import { Button } from '@/components/landing-page/button';
import { Nav } from '@/components/landing-page/nav';
import { HeroTitleSVG } from '@/components/landing-page/sections/hero/title';
import { MarqueeNugget } from '@/components/landing-page/sections/hero/marquee-nugget';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { HeroGrid } from '@/components/landing-page/sections/hero/grid';
import { Marquee } from '@/components/magicui/marquee';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Gold Rush 2.0">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <Nav></Nav>
            <main className='bg-white min-h-full text-foreground'>
                <section className='flex flex-col min-h-svh pt-[80px] relative z-0 overflow-hidden'>
                    <div className='max-w-6xl mx-auto flex-1 grid grid-cols-2'>
                        <div className='flex flex-col gap-4 justify-between pb-6'>
                            <HeroTitleSVG></HeroTitleSVG>
                            <div className='flex flex-col gap-4 text-end'>
                                <div className='text-large font-bold'>
                                    There's a World Behind This Door.
                                </div>
                            </div>
                            <div className='flex flex-col gap-4'>
                                <div className='text-large'>
                                    The definitive intelligence hub for the modern gold enthusiast. A fusion of live market data, an expert AI historian, and community-driven discovery.
                                </div>
                                <Button className='uppercase'>Explore the hub</Button>
                            </div>
                        </div>
                        <div className=''>
                            <HeroGrid className={"absolute -z-10 top-0 right-0 max-w-xl h-full"}></HeroGrid>
                        </div>
                    </div>
                    <div className='w-full max-h-12 bg-slate-950 text-background text-nowrap items-center'>
                        <Marquee className="[--duration:20s]" repeat={10}>
                            <div className='flex items-center gap-4'>
                                <span>AI-POWERED INSIGHTS</span>
                                <MarqueeNugget></MarqueeNugget>
                                <span>LIVE MARKET DATA</span>
                                <MarqueeNugget></MarqueeNugget>
                                <span>THE HISTORIAN AI</span>
                                <MarqueeNugget></MarqueeNugget>
                            </div>
                        </Marquee>
                    </div>
                </section>
                <section className='flex flex-col min-h-svh pt-[80px] relative z-0 overflow-hidden'>
                    <div className='max-w-6xl mx-auto flex-1 grid grid-cols-2'>
                        <div className='flex flex-col gap-4 justify-between pb-6'>
                            <HeroTitleSVG></HeroTitleSVG>
                            <div className='flex flex-col gap-4 text-end'>
                                <div className='text-large font-bold'>
                                    There's a World Behind This Door.
                                </div>
                            </div>
                            <div className='flex flex-col gap-4'>
                                <div className='text-large'>
                                    The definitive intelligence hub for the modern gold enthusiast. A fusion of live market data, an expert AI historian, and community-driven discovery.
                                </div>
                                <Button className='uppercase'>Explore the hub</Button>
                            </div>
                        </div>
                        <div className=''>
                            <HeroGrid className={"absolute -z-10 top-0 right-0 max-w-xl h-full"}></HeroGrid>
                        </div>
                    </div>
                    <div className='w-full max-h-12 bg-slate-950 text-background text-nowrap items-center'>
                        <Marquee className="[--duration:20s]" repeat={10}>
                            <div className='flex items-center gap-4'>
                                <span>AI-POWERED INSIGHTS</span>
                                <MarqueeNugget></MarqueeNugget>
                                <span>LIVE MARKET DATA</span>
                                <MarqueeNugget></MarqueeNugget>
                                <span>THE HISTORIAN AI</span>
                                <MarqueeNugget></MarqueeNugget>
                            </div>
                        </Marquee>
                    </div>
                </section>
            </main>
        </>
    );
}
