import { Menu } from "lucide-react";
import { BrandLogo } from "../brand-logo";
import { Separator } from "../ui/separator";
import { Button } from "./button";
import { useIsMobile } from "@/hooks/use-mobile";

export function Nav() {
    return (
        <nav className="min-w-screen flex justify-center bg-foreground text-background fixed z-50 py-1">
            <div className="w-full mx-12 flex justify-between items-center">
                <BrandLogo />
                {
                    useIsMobile() ?
                        <>
                            <Button variant="nav"><Menu/></Button>
                        </>
                        :
                        <>
                            <ul className="flex flex-1 gap-8 justify-around items-center">
                                <li>
                                    <a className="text-lg">About</a>
                                </li>
                                <li>
                                    <a className="text-lg">Litepaper</a>
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