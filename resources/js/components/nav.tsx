import { Menu } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { Separator } from "./ui/separator";
import { Button } from "./landing-page/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "./link";
import { router } from '@inertiajs/react';

export function Nav() {
    return (
        <nav className="min-w-screen flex justify-center bg-foreground text-background fixed z-50 py-2">
            <div className="w-full mx-4 xl:mx-12 flex justify-between items-center">
                <BrandLogo />
                {
                    useIsMobile() ?
                        <>
                            <Button variant="nav" onClick={() => router.visit('/')}><Menu/></Button>
                        </>
                        :
                        <>
                            <ul className="flex flex-1 gap-8 justify-around items-center text-lg">
                                <li>
                                    <Link className="text-background">About</Link>
                                </li>
                                <li>
                                    <Link className="text-background">Resources</Link>
                                </li>
                            </ul>
                            <Button variant="nav">CONNECT YOUR WALLET</Button>
                        </>
                }
            </div>
            <Separator className="absolute bottom-0" />
        </nav>
    )
}