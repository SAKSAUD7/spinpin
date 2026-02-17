"use client";

import { ReactNode, useEffect, useRef } from "react";

interface MarqueeProps {
    children: ReactNode;
    speed?: number;
}

export function Marquee({ children, speed = 50 }: MarqueeProps) {
    const marqueeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const marquee = marqueeRef.current;
        if (!marquee) return;

        const marqueeContent = marquee.querySelector(".marquee-content") as HTMLElement;
        if (!marqueeContent) return;

        // Clone the content for seamless loop
        const clone = marqueeContent.cloneNode(true) as HTMLElement;
        marquee.appendChild(clone);

        let animationId: number;
        let position = 0;
        const contentWidth = marqueeContent.offsetWidth;

        const animate = () => {
            position -= speed / 60; // 60fps
            if (Math.abs(position) >= contentWidth) {
                position = 0;
            }
            marquee.style.transform = `translateX(${position}px)`;
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [speed]);

    return (
        <div className="overflow-hidden whitespace-nowrap">
            <div ref={marqueeRef} className="inline-flex">
                <div className="marquee-content inline-flex">
                    {children}
                </div>
            </div>
        </div>
    );
}
