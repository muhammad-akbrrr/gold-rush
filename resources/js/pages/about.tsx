import { HeroSection } from '@/components/about/sections/hero';
import { Innovation } from '@/components/about/sections/innovation';
import { Mission } from '@/components/about/sections/mission';
import { Values } from '@/components/about/sections/values';
import { Footer } from '@/components/footer';
import { CTA } from '@/components/landing-page/cta';
import { Nav } from '@/components/nav';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function About() {
    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (!theme) {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return (
        <>
            <Head title="Gold Rush 2.0">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <Nav></Nav>
            <main className="min-h-full bg-white text-foreground">
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
