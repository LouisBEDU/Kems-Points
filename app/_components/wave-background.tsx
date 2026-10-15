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
const REVEAL_DURATION = 2000;
const BLOB_POINTS = 48;
const BLOB_WOBBLES = [
  { lobes: 3, amplitude: 0.09, speed: 2.2, phase: 0 },
  { lobes: 5, amplitude: 0.05, speed: -3.1, phase: 1.7 },
  { lobes: 8, amplitude: 0.025, speed: 4.3, phase: 4.1 },
] as const;
const BLOB_WOBBLE_TOTAL = BLOB_WOBBLES.reduce(
  (sum, { amplitude }) => sum + amplitude,
  0,
);

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

function curveTo(p0: Point, p1: Point, p2: Point, p3: Point) {
  const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
  const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
  return `C${fmt(c1.x)} ${fmt(c1.y)} ${fmt(c2.x)} ${fmt(c2.y)} ${fmt(p2.x)} ${fmt(p2.y)}`;
}

function wavePath(points: Point[]) {
  const first = points[0];
  const last = points[points.length - 1];
  const curves = points
    .slice(0, -1)
    .map((p1, i) =>
      curveTo(
        points[i - 1] ?? p1,
        p1,
        points[i + 1],
        points[i + 2] ?? points[i + 1],
      ),
    );
  return `M0 ${fmt(first.y)}L${fmt(first.x)} ${fmt(first.y)}${curves.join("")}L0 ${fmt(last.y)}Z`;
}

const INITIAL_PATH = wavePath(wavePoints(INITIAL_STATES));

function blobPath(center: Point, radius: number, time: number) {
  const points = Array.from({ length: BLOB_POINTS }, (_, i) => {
    const angle = (2 * Math.PI * i) / BLOB_POINTS;
    const wobble = BLOB_WOBBLES.reduce(
      (sum, { lobes, amplitude, speed, phase }) =>
        sum + amplitude * Math.sin(lobes * angle + speed * time + phase),
      0,
    );
    const r = radius * (1 + wobble);
    return {
      x: center.x + r * Math.cos(angle),
      y: center.y + r * Math.sin(angle),
    };
  });
  const at = (i: number) => points[(i + BLOB_POINTS) % BLOB_POINTS];
  const curves = points.map((p1, i) =>
    curveTo(at(i - 1), p1, at(i + 1), at(i + 2)),
  );
  return `M${fmt(points[0].x)} ${fmt(points[0].y)}${curves.join("")}Z`;
}

const prefersReducedMotion = () =>
  globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function WaveBackground({
  started = false,
  revealing = false,
  onRevealEnd,
  children,
}: {
  started?: boolean;
  revealing?: boolean;
  onRevealEnd?: () => void;
  children?: ReactNode;
}) {
  const inkPathRef = useRef<SVGPathElement>(null);
  const teamPathRef = useRef<SVGPathElement>(null);
  const revealRef = useRef<SVGSVGElement>(null);
  const blobRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

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
      onUpdate: () => {
        const d = wavePath(wavePoints(states));
        inkPathRef.current?.setAttribute("d", d);
        teamPathRef.current?.setAttribute("d", d);
      },
    });

    return () => {
      renderer.cancel();
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  useEffect(() => {
    const reveal = revealRef.current;
    const blob = blobRef.current;
    if (!revealing || !reveal || !blob) return;

    const { width, height } = reveal.getBoundingClientRect();
    const center = { x: width / 2, y: height / 2 };
    const maxRadius = Math.hypot(width, height) / 2 / (1 - BLOB_WOBBLE_TOTAL);
    const growth = { radius: 0, time: 0 };
    const draw = () =>
      blob.setAttribute("d", blobPath(center, growth.radius, growth.time));
    draw();

    const duration = prefersReducedMotion() ? 0 : REVEAL_DURATION;
    const animation = animate(growth, {
      radius: { to: maxRadius, ease: "inQuad" },
      time: { to: duration / 1000, ease: "linear" },
      duration,
      onUpdate: draw,
      onComplete: () => onRevealEnd?.(),
    });

    return () => {
      animation.cancel();
    };
  }, [revealing, onRevealEnd]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-paper">
      <svg
        aria-hidden
        className="absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path ref={inkPathRef} className="fill-ink" d={INITIAL_PATH} />
      </svg>
      <svg
        ref={revealRef}
        aria-hidden
        className={`absolute inset-0 size-full ${started ? "opacity-100" : "opacity-0"} ${
          revealing ? "" : "transition-opacity duration-500"
        }`}
      >
        <defs>
          <mask id="reveal-mask">
            <path ref={blobRef} fill="white" />
          </mask>
        </defs>
        <g mask={revealing ? "url(#reveal-mask)" : undefined}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <rect width="100" height="100" className="fill-team-2" />
            <path ref={teamPathRef} className="fill-team-1" d={INITIAL_PATH} />
          </svg>
        </g>
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
