import { Marquee } from "@/components/magicui/marquee";
import { Button } from "../button";
import { HeroGrid } from "../../grid";
import { HeroTitleSVG } from "./hero/title";
import { GoldNugget } from "@/components/gold-nugget";


export const HeroSection = () => {

    return (
        <section className='flex flex-col min-h-svh pt-[80px] relative z-0 overflow-hidden bg-background'>
            <div className='mx-12 flex-1 grid grid-cols-2'>
                <div className='flex flex-col gap-4 justify-between pb-6'>
                    <HeroTitleSVG></HeroTitleSVG>
                    <div className='flex flex-col gap-4 text-end'>
                        <div className='text-large font-bold'>
                            There's a World Behind This Door.
                        </div>
                    </div>
                    <div className='flex flex-col gap-4'>
                        <p className='text-large'>
                            The definitive intelligence hub for the modern gold enthusiast. A fusion of live market data, an expert AI historian, and community-driven discovery.
                        </p>
                        <Button className='uppercase'>Explore the hub</Button>
                    </div>
                </div>
                <div className=''>
                    <HeroGrid className={"absolute -z-10 top-0 right-0 max-w-xl h-full"}></HeroGrid>
                </div>
            </div>
            <div className='w-full max-h-12 bg-slate-950 text-background text-nowrap items-center'>
                <Marquee className="[--duration:20s]" repeat={10}>
                    <div className='flex items-center gap-8'>
                        <span>AI-POWERED INSIGHTS</span>
                        <GoldNugget></GoldNugget>
                        <span>LIVE MARKET DATA</span>
                        <GoldNugget></GoldNugget>
                        <span>THE HISTORIAN AI</span>
                        <GoldNugget></GoldNugget>
                        <span>COMMUNITY DISCOVERY</span>
                        <GoldNugget></GoldNugget>
                        <span>THE RUSH IS LIVE</span>
                        <GoldNugget></GoldNugget>
                        <span>STATUS IS EARNED, NOT BOUGHT</span>
                        <GoldNugget></GoldNugget>
                    </div>
                </Marquee>
            </div>
        </section>
    )
}