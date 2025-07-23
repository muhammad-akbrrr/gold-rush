import { Button } from '@/components/landing-page/button';
import { Nav } from '@/components/landing-page/nav';
import { HeroTitleSVG } from '@/components/landing-page/sections/hero/title';
import { GoldNugget } from '@/components/gold-nugget';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { HeroGrid } from '@/components/grid';
import { Marquee } from '@/components/magicui/marquee';
import { HeroSection } from '@/components/landing-page/sections/hero';
import { LiveOperation } from '@/components/landing-page/sections/live-operation';

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
                <HeroSection></HeroSection>
                <LiveOperation></LiveOperation>
            </main>
        </>
    );
}
