import React from 'react';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const { useRef } = React;

interface InputProps {
    className?: string;
    variant?: string;
}

export function Input(props: InputProps) {
    const { className = "", variant = "default" } = props;

    const container = useRef<HTMLDivElement>(null);

    return (
        <div ref={container} className='relative h-[68px] text-background text-center flex justify-center'>
            <div className='absolute inset-0 bg-background clip-bevel' />
            <div className='absolute inset-[1px] bg-foreground clip-bevel' />
            <div className='absolute inset-[1px] bg-foreground clip-bevel'></div>
            <input className='relative w-full p-4 focus:border-0' placeholder='Enter your email' />
        </div>
    );
}