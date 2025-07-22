import React from "react";

interface NuggetProps {
    className?: string;
}

export const MarqueeNugget: React.FC<NuggetProps> = ({ className = "" }) => {
    return (
        <svg className="size-8" width="41" height="43" viewBox="0 0 41 43" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="mask0_261_2606" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="1" y="1" width="39" height="41">
                <path d="M39.7746 18.425L18.2496 1L1.84961 16.375L10.0496 37.9L34.6496 42L39.7746 18.425Z" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_261_2606)">
                <path d="M2.875 19.45L19.275 29.7L39.775 19.45L18.25 1L2.875 15.35V19.45Z" fill="#F2B617" />
                <path d="M19.275 29.7L2.875 19.45L9.025 37.9L18.25 38.925L19.275 29.7Z" fill="#D48C20" />
                <path d="M39.775 19.45L19.275 29.7L18.25 38.925L34.65 42L39.775 19.45Z" fill="#D18D0E" />
                <path d="M2.875 19.45L19.275 29.7M2.875 19.45L9.025 37.9L18.25 38.925M2.875 19.45V15.35L18.25 1L39.775 19.45M19.275 29.7L39.775 19.45M19.275 29.7L18.25 38.925M39.775 19.45L34.65 42L18.25 38.925" stroke="#A4640D" strokeWidth="2" strokeLinecap="round" strokeLinejoin
                ="round" />
                <path d="M24.4 15.35L13.125 6.125L18.25 1L39.775 18.425L36.7 21.5L24.4 15.35Z" fill="#F3ED95" />
            </g>
            <path d="M39.7746 18.425L18.2496 1L1.84961 16.375L10.0496 37.9L34.6496 42L39.7746 18.425Z" stroke="#2F3032" strokeWidth="2" strokeLinecap="round" strokeLinejoin
            ="round" />
        </svg>
    )
}