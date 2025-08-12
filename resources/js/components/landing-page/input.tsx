import React from 'react';
import { cn } from '@/lib/utils';

const { useRef } = React;

interface InputProps {
    placeholder?: string;
    className?: string;
}

export function Input(props: InputProps) {
    const { placeholder = "", className } = props;

    const container = useRef<HTMLDivElement>(null);

    return (
        <div ref={container} className={cn(className, "relative h-[68px] text-background text-center flex justify-center")}>
            <div className='absolute inset-0 bg-background clip-bevel' />
            <div className='absolute inset-[1px] bg-foreground clip-bevel' />
            <div className='absolute inset-[1px] bg-foreground clip-bevel'></div>
            <input className='relative w-full p-4 focus-visible:outline-none' placeholder={placeholder} />
        </div>
    );
}