'use client';
import { router } from '@inertiajs/react';
import type { VisitOptions } from '@inertiajs/core';
import gsap from 'gsap';
import { useCallback } from 'react';

export function usePageExit() {
    return useCallback(async (href: string, options: VisitOptions = {}) => {
        const hole = document.querySelector<SVGPathElement>('#hole-path');
        const windowHeight = window.innerHeight;

        if (!hole) {
            router.visit(href, options);
            return;
        }

        gsap.killTweensOf(hole);

        await gsap
            .timeline()
            .to(hole, {
                scale: 2,
            })
            .to(hole, {
                y: -windowHeight/2 + hole.getBoundingClientRect().height/2,
                delay: .5,
                duration: 1
            });

        router.visit(href, options);
    }, []);
}
