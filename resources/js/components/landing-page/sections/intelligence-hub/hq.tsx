import { cn } from "@/lib/utils";


interface HqProps {
    className?: string;
}

export const Hq = ({className} : HqProps) => {
    return (
        <svg className={cn("", className)} width="543" height="303" viewBox="0 0 543 303" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0H60.6895V122.334L89.7803 109.372H154.482L182.068 122.334V0H242.758V283.556H182.068V171.754L168.025 154.741H69.2161L60.6895 162.437V283.556H0V0Z" fill="#47484B" />
            <path d="M348.392 0H497.358L543 54.2807V156.361L482.311 207.401V62.7874L467.765 45.7741H370.461L361.935 53.4706V219.959L376.48 237.782H438.674L423.126 219.148L469.27 193.223L539.489 277.48L493.345 303L475.79 283.556H346.888L301.245 229.275V38.8877L348.392 0Z" fill="#47484B" />
        </svg>
    )
}