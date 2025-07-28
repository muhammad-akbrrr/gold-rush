"use client";
import React from "react";
import { useState } from "react";

import { Separator } from "@/components/ui/separator"
import { Hq } from "./intelligence-hub/hq";
import { Grid } from "@/components/grid";

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const { useRef } = React;

export const IntelligenceHub = () => {
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const container = useRef<HTMLDivElement>(null);
    useGSAP(() => {
        if (activeIndex !== null) {
            const tabs = gsap.utils.toArray<HTMLElement>('img', container.current);

            gsap.to(tabs, { filter: 'saturate(0)', duration: 0.3 });
            gsap.to(tabs[activeIndex], { filter: 'saturate(1)', duration: 0.3 });
        }
    }, [activeIndex, container]);

    const images = [
        '/images/36523362.png',
        '/images/36523363.png',
        '/images/36523364.png',
    ];

    const contents = {
        selected: ["The Historian", "Test 1", "Test 2"],
        source: ["Private Archives", "Test 1", "Test 2"],
        function: ["On-demand Expert", "Test 2", "Test 3"],
        headText: ["Your On-Demand Gold Expert", "Test 1", "Test 2"],
        title: ["The Historian AI", "Test 1", "Test 2"],
        desc: [
            "Ask any question, from complex geological queries to the rich history of the great gold rushes. The Historian is an expert AI trained exclusively on our private, curated library of rare documents, ensuring you get intelligent, on-topic answers unavailable anywhere else.",
            "Test 1",
            "Test 2"
        ]
    }

    return (
        <section className='flex flex-col min-h-svh relative z-0 overflow-hidden bg-background text-muted-foreground text-xl'>
            <h2 className="sr-only">Intelligence Hub</h2>
            <Separator className="mt-24" />
            <div className="flex-1 grid grid-cols-3">
                <div className="relative flex flex-col gap-4 justify-between">
                    <div className="flex-1 flex flex-col justify-center gap-4 font-bold mx-12 py-4">
                        <p>The Modern Prospectors’</p>
                        <Hq className="w-full h-auto" />
                    </div>
                    <div className="flex-1 flex flex-col items-stretch font-bold uppercase text-xl">
                        <Separator />
                        <p className="flex-1 flex items-center mx-12">
                            Selected: {contents.selected[activeIndex]}
                        </p>
                        <Separator />
                        <p className="flex-1 flex items-center mx-12">
                            Source: {contents.source[activeIndex]}
                        </p>
                        <Separator />
                        <p className="flex-1 flex items-center mx-12">
                            Function: {contents.function[activeIndex]}
                        </p>
                        <Separator />
                    </div>
                    <div ref={container} className="mx-12 py-4 flex gap-4 items-center justify-between">
                        {images.map((src, index) => {
                            return (
                                <img
                                    key={index}
                                    src={src}
                                    onClick={() => setActiveIndex(index)}
                                    className={`w-full h-auto cursor-pointer transition-all duration-300`}
                                    alt={`Image ${index}`}
                                />
                            )
                        })}
                    </div>
                    <Separator orientation="vertical" className="absolute right-0" />
                </div>
                <div className="relative overflow-hidden">
                    <Grid className={"absolute -z-10 inset-0 m-auto max-w-4xl h-auto"} />
                </div>
                <div className="relative flex flex-col gap-4 justify-between">
                    <Separator orientation="vertical" className="absolute left-0" />
                    <div className="flex-1 flex flex-col justify-center gap-4 text-large font-bold ms-12 py-4">
                        <p className="capitalize">Your On-demand Gold Expert</p>
                        <p className="text-2xl font-bold uppercase">The Historian AI</p>
                    </div>
                    <p className="ms-12 py-4 text-xl/8">
                        Ask any question, from complex geological queries to the rich history of the great gold rushes. The Historian is an expert AI trained exclusively on our private, curated library of rare documents, ensuring you get intelligent, on-topic answers unavailable anywhere else.
                    </p>
                </div>
            </div>
            <Separator className="mb-12" />
        </section>
    )
}