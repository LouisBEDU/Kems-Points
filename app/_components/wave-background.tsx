"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { animate, createTimer, type JSAnimation, utils } from "animejs";

type Point = { x: number; y: number };
type WaveState = { amplitude: number; phase: number };

const WAVES = [
  { frequency: 0.7, amplitude: [2, 5] },
  { frequency: 1.3, amplitude: [0.5, 1.5] },
] as const;
const SAMPLES = 40;

const INITIAL_STATES: WaveState[] = WAVES.map(
  ({ amplitude: [min, max] }, i) => ({
    amplitude: (min + max) / 2,
    phase: i * 2,
  }),
);

function wavePoints(states: WaveState[]): Point[] {
  return Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const y = -5 + (110 * i) / SAMPLES;
    const offset = WAVES.reduce(
      (sum, { frequency }, w) =>
        sum +
        states[w].amplitude *
          Math.sin(2 * Math.PI * frequency * (y / 100) + states[w].phase),
      0,
    );
    return { x: 50 + offset, y };
  });
}

const fmt = (n: number) => n.toFixed(2);

function wavePath(points: Point[]) {
  const first = points[0];
  const last = points[points.length - 1];
  const curves = points.slice(0, -1).map((p1, i) => {
    const p0 = points[i - 1] ?? p1;
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    return `C${fmt(c1.x)} ${fmt(c1.y)} ${fmt(c2.x)} ${fmt(c2.y)} ${fmt(p2.x)} ${fmt(
      p2.y,
    )}`;
  });
  return `M0 ${fmt(first.y)}L${fmt(first.x)} ${fmt(first.y)}${curves.join(
    "",
  )}L0 ${fmt(last.y)}Z`;
}

export function WaveBackground({ children }: { children: ReactNode }) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const states = INITIAL_STATES.map((state) => ({ ...state }));
    const animations: JSAnimation[] = [];

    const morph = (w: number) => {
      const [min, max] = WAVES[w].amplitude;
      animations[w] = animate(states[w], {
        amplitude: utils.random(min, max, 2),
        phase: states[w].phase + utils.random(-Math.PI, Math.PI, 2),
        duration: utils.random(4000, 8000),
        ease: "inOutSine",
        onComplete: () => morph(w),
      });
    };
    states.forEach((_, w) => morph(w));

    const renderer = createTimer({
      onUpdate: () =>
        pathRef.current?.setAttribute("d", wavePath(wavePoints(states))),
    });

    return () => {
      renderer.cancel();
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-team-2">
      <svg
        aria-hidden
        className="absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          className="fill-team-1"
          d={wavePath(wavePoints(INITIAL_STATES))}
        />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
