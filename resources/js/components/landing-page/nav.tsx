import { BrandLogo } from "../brand-logo";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "../ui/navigation-menu";
import { Separator } from "../ui/separator";

export function Nav() {
    return (
        <nav className="min-w-screen flex justify-center bg-foreground text-background fixed z-50">
            <div className="w-full mx-12 flex justify-between items-center">
                <BrandLogo />
                <ul className="flex flex-1 gap-8 justify-around">
                    <li>
                        <a className="text-lg">About</a>
                    </li>
                    <li>
                        <a className="text-lg">Features</a>
                    </li>
                    <li>
                        <a className="text-lg">Litepaper</a>
                    </li>
                </ul>
            </div>
            <Separator className="absolute bottom-0"/>
        </nav>
    )
}