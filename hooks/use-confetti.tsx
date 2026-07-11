"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const CONFETTI_COUNT = 50;
const CONFETTI_COLORS = [
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#f9ca24",
  "#f0932b",
  "#eb4d4b",
  "#6c5ce7",
  "#74b9ff",
  "#00b894",
  "#fdcb6e",
];

export function useConfetti() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pieces = Array.from({ length: CONFETTI_COUNT }, () => {
      const el = document.createElement("div");
      const size = Math.random() * 10 + 5;

      el.className = "pointer-events-none absolute rounded-sm";
      el.style.width = `${size}px`;
      el.style.height = `${size * 0.6}px`;
      el.style.backgroundColor =
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = "-20px";
      container.appendChild(el);

      return {
        el,
        delay: Math.random() * 2,
        rotation: Math.random() * 360,
      };
    });

    pieces.forEach(({ el, delay, rotation }) => {
      gsap.to(el, {
        y: window.innerHeight + 100,
        x: `+=${Math.random() * 200 - 100}`,
        rotation: rotation + Math.random() * 720 - 360,
        duration: 3 + Math.random() * 5,
        delay,
        ease: "power1.out",
        onComplete: () => el.remove(),
      });
    });

    const timeoutId = window.setTimeout(() => {
      pieces.forEach(({ el }) => el.remove());
    }, 8000);

    return () => {
      window.clearTimeout(timeoutId);
      pieces.forEach(({ el }) => el.remove());
    };
  }, []);

  const ConfettiRenderer = () => (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    />
  );

  return { ConfettiRenderer };
}
