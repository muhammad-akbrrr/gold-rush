import { BrandName } from "./brand-name"
import { Grid } from "./grid"
import { Separator } from "./ui/separator"

export const Footer = () => {
    return (
        <footer className="relative flex flex-col justify-between min-h-screen overflow-hidden text-muted-foreground">
            <Grid className="absolute inset-0 m-auto w-full h-auto" />
            <div className="relative flex flex-col gap-4 items-stretch bg-background">
                <Separator className="mb-24" />
                <BrandName />
                <p className="max-w-xl ms-12 font-bold text-xl">Project Gold Rush is a live, interactive platform for digital discovery.</p>
                <Separator />
            </div>
            <div className="relative grid grid-cols-3 gap-4 bg-background">
                <Separator className="absolute top-0" />
                <ul className="space-y-4 py-4 mx-12">
                    <li className="text-xl font-bold">Resources</li>
                    <li>
                        <a className="text-lg cursor-pointer">Litepaper</a>
                    </li>
                    <li>
                        <a className="text-lg cursor-pointer">Roadmap</a>
                    </li>
                    <li>
                        <a className="text-lg cursor-pointer">Media Kit</a>
                    </li>
                    <li>
                        <a className="text-lg cursor-pointer">FAQ</a>
                    </li>
                </ul>
                <ul className="space-y-4 py-4 mx-12">
                    <li className="text-xl font-bold">Community</li>
                    <li>
                        <a className="text-lg cursor-pointer">Discord</a>
                    </li>
                    <li>
                        <a className="text-lg cursor-pointer">Twitter (X)</a>
                    </li>
                    <li>
                        <a className="text-lg cursor-pointer">Telegram</a>
                    </li>
                    <li>
                        <a className="text-lg cursor-pointer">Medium</a>
                    </li>
                </ul>
                <ul className="space-y-4 py-4 mx-12">
                    <li className="text-xl font-bold">Legal</li>
                    <li>
                        <a className="text-lg cursor-pointer">Privacy Policy</a>
                    </li>
                    <li>
                        <a className="text-lg cursor-pointer">Terms and Conditions</a>
                    </li>
                    <li>
                        <a className="text-lg cursor-pointer">Contact Us</a>
                    </li>
                </ul>
                <Separator className="absolute bottom-0" />
            </div>
            <div className="relative py-4 bg-background text-center">
                <Separator className="absolute top-0" />
                © 2025 [Your Company Name]. A registered Swiss entity. All rights reserved.
            </div>
        </footer>
    )
}