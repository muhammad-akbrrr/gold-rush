import { Grid } from "./grid"
import { Separator } from "./ui/separator"

export const Footer = () => {
    return (
        <footer className="relative flex flex-col justify-between min-h-screen overflow-hidden text-muted-foreground">
            <Grid className="absolute inset-0 m-auto w-full h-auto" />
            <div className="relative flex flex-col gap-4 items-stretch bg-background">
                <Separator className="mb-24" />
                <svg className="mx-12 h-auto" viewBox="0 0 1824 171" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.8576 4.75H92.6574L112.139 33.9625L93.1326 53.2L78.64 31.5875H33.0241L28.7476 36.1V134.9L34.6871 144.163H86.0051V95.7125H52.5059V69.1125H102.636L114.515 87.1625V171H20.4321L0 140.363V27.55L21.8576 4.75Z" fill="#47484B" />
                    <path d="M164.552 4.75H236.065L256.972 36.575V148.2L235.352 171H164.077L142.457 139.175V27.55L164.552 4.75ZM171.205 133.95L178.095 144.163H223.711L228.225 139.413V41.8L221.335 31.5875H175.481L171.205 36.3375V133.95Z" fill="#47484B" />
                    <path d="M284.677 4.75H313.424V133.475L320.789 144.163H370.919V126.825H399.667V171H306.297L284.677 138.225V4.75Z" fill="#47484B" />
                    <path d="M429.509 4.75H510.288L544.5 55.8125V148.438L522.88 171H429.509V4.75ZM458.257 31.5875V144.4H511L515.752 139.65V61.275L495.558 31.5875H458.257Z" fill="#47484B" />
                    <path d="M712.048 4.75H799.241L827.038 45.3625V73.15L805.18 95.7125L827.038 127.775V171H798.29V132.762L776.67 101.175H753.387L740.795 93.3375V171H712.048V4.75ZM740.795 31.5875V74.3375H789.025L798.29 64.8375V51.0625L784.748 31.5875H740.795Z" fill="#47484B" />
                    <path d="M940.748 4.75H969.495V171H940.748V162.925L927.68 171H876.125L854.505 139.175V4.75H883.252V133.713L890.142 144.163H935.996L940.748 139.413V4.75Z" fill="#47484B" />
                    <path d="M1019.53 4.75H1091.52L1107.91 29.45L1088.43 48.45L1077.03 31.5875H1030.7L1026.42 36.1V63.8875L1033.55 74.3375H1093.66L1112.66 103.075V150.812L1093.18 171H1010.27L996.249 151.05L1015.02 131.575L1024.28 144.163H1081.3L1083.92 142.025V107.825L1079.17 101.175H1019.06L997.675 69.35V27.55L1019.53 4.75Z" fill="#47484B" />
                    <path d="M1139.42 4.75H1168.17V76.475L1181.95 68.875H1212.59L1225.66 76.475V4.75H1254.41V171H1225.66V105.45L1219.01 95.475H1172.21L1168.17 99.9875V171H1139.42V4.75Z" fill="#47484B" />
                    <path d="M1447.38 0H1519.37L1539.8 30.6375V54.15L1453.79 143.213V144.163H1539.8V171H1425.28V134.425L1513.19 44.175L1501.55 26.8375H1458.55L1439.06 46.075L1423.86 23.9875L1447.38 0Z" fill="#47484B" />
                    <path d="M1601 171V124.45H1647.57V171H1601Z" fill="#47484B" />
                    <path d="M1731.58 0H1802.86L1824 31.5875V148.2L1802.38 171H1731.1L1709.48 139.175V22.5625L1731.58 0ZM1738.23 31.5875V99.5125L1795.25 40.375V37.05L1788.36 26.8375H1742.51L1738.23 31.5875ZM1738.23 134.425L1745.12 144.163H1790.74L1795.25 139.413V73.625L1738.23 133V134.425Z" fill="#47484B" />
                </svg>
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