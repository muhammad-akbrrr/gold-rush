
import { cn } from "@/lib/utils"

interface FrontendProps {
    className?: string;
}

export function Frontend(props: FrontendProps) {
    const { className } = props;

    return (
        <svg className={cn("", className)} viewBox="0 0 109 109" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0 54.5L37.4688 17.0312L54.5 34.0625L34.0625 54.5L54.5 74.9375L37.4688 91.9688L0 54.5ZM54.5 74.9375L74.9375 54.5L54.5 34.0625L71.5312 17.0312L109 54.5L71.5312 91.9688L54.5 74.9375Z" fill="#47484B" />
        </svg>
    )
}

