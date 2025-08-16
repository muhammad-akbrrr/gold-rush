import { Nav } from '@/components/nav';
import { Head, usePage } from '@inertiajs/react';
import { HeroSection } from '@/components/about/sections/hero';
import { LiveOperation } from '@/components/landing-page/sections/live-operation';
import { IntelligenceHub } from '@/components/landing-page/sections/intelligence-hub';
import { Tools } from '@/components/landing-page/sections/tools';
import { Footer } from '@/components/footer';
import { Reputation } from '@/components/landing-page/sections/reputation';
import { CTA } from '@/components/landing-page/cta';
import { Trust } from '@/components/landing-page/sections/trust';
import { Mission } from '@/components/about/sections/mission';
import { Innovation } from '@/components/about/sections/innovation';
import { Values } from '@/components/about/sections/values';

export default function About() {
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
                <Mission />
                <Innovation />
                <Values />
                <CTA />
            </main>
            <Footer />
        </>
    );
}
