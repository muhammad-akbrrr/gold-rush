import { cn } from "@/lib/utils";

interface CornersProps {
    className?: string;
    position?: string;
}

export function Corners(props: CornersProps) {

    const { className = "absolute h-1/2", position = "top left" } = props;

    return (
        <svg
            className={cn(`${
                position === "top left" ? "top-0 left-0" :
                position === "top right" ? "top-0 right-0 -scale-x-100" :
                position === "bottom left" ? "bottom-0 left-0 -scale-y-100" :
                position === "bottom right" ? "bottom-0 right-0 -scale-100" :
                ""
            }`, className)}
            viewBox="0 0 312 485"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_368_8)">
                <path d="M283 24H43.5V43.5H24V400.75H43.5V434.525H24V454.025H62" stroke="#F8ECC6" stroke-width="5" stroke-linejoin="bevel" />
            </g>
            <defs>
                <filter id="filter0_d_368_8" x="-6.9" y="-6.9" width="318.3" height="491.825" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="14.2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.972549 0 0 0 0 0.92549 0 0 0 0 0.776471 0 0 0 1 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_368_8" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_368_8" result="shape" />
                </filter>
            </defs>
        </svg>
    );
}