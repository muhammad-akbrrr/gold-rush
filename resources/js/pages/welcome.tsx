import { Footer } from '@/components/footer';
import { CTA } from '@/components/landing-page/cta';
import { HeroSection } from '@/components/landing-page/sections/hero';
import { IntelligenceHub } from '@/components/landing-page/sections/intelligence-hub';
import { LiveOperation } from '@/components/landing-page/sections/live-operation';
import { Reputation } from '@/components/landing-page/sections/reputation';
import { Tools } from '@/components/landing-page/sections/tools';
import { Trust } from '@/components/landing-page/sections/trust';
import { Nav } from '@/components/nav';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile } from '@/hooks/use-mobile';
import PageTransition from '@/components/page-transition';

export default function Welcome() {
    const isMobile = useIsMobile();

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (!theme) {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            ScrollTrigger.refresh();
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isMobile]);

    // useEffect(() => { playEnter(); }, []);

    return (
        <>
            <Head title="Gold Rush 2.0">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <PageTransition />
            <Nav></Nav>
            <main className="min-h-full bg-white text-foreground">
                <HeroSection />
                <LiveOperation />
                <IntelligenceHub />
                <Tools />
                <Reputation />
                <Trust />
                <CTA />
            </main>
            <Footer />
        </>
    );
}
