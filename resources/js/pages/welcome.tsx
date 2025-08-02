import { Nav } from '@/components/landing-page/nav';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { HeroSection } from '@/components/landing-page/sections/hero';
import { LiveOperation } from '@/components/landing-page/sections/live-operation';
import { IntelligenceHub } from '@/components/landing-page/sections/intelligence-hub';
import { Tools } from '@/components/landing-page/sections/tools';
import { Footer } from '@/components/footer';
import { Reputation } from '@/components/landing-page/sections/reputation';
import { CTA } from '@/components/landing-page/cta';

export default function Welcome() {
    // const { auth } = usePage<SharedData>().props;

    const theme = localStorage.getItem("theme");
    if (!theme) {
        document.documentElement.classList.remove('dark'); // default to light
    }

    return (
        <>
            <Head title="Gold Rush 2.0">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <Nav></Nav>
            <main className='bg-white min-h-full text-foreground'>
                <HeroSection />
                <LiveOperation />
                <IntelligenceHub />
                <Tools />
                <Reputation />
                <CTA />
            </main>
            <Footer />
        </>
    );
}
