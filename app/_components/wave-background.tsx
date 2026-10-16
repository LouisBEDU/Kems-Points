"use client";

import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { animate, createTimer, type JSAnimation, utils } from "animejs";
import { MIN_TEAMS } from "../_lib/config.ts";
import { prefersReducedMotion } from "../_lib/motion.ts";
import { zoneCenter } from "../_lib/zones.ts";

type Point = { x: number; y: number };
type WaveState = { amplitude: number; phase: number };
type Shape = {
  waves: { x: WaveState[]; y: WaveState[] };
  split3: number;
  split4: number;
  ripple: number;
  swirl: number;
};
type Arm = { points: Point[]; far: Point };
type Flood = { team: number | null; reach: number };

const WAVES = [
  { frequency: 0.7, amplitude: [2, 5] },
  { frequency: 1.3, amplitude: [0.5, 1.5] },
] as const;
const ARM_SAMPLES = 32;
const FAR = 300;
const OUTER = 500;
const TOP = { x: 50, y: -15 };
const BOTTOM = { x: 50, y: 115 };
const TOP_LEFT = { x: -15, y: -15 };
const TOP_RIGHT = { x: 115, y: -15 };
const BOTTOM_LEFT = { x: -15, y: 115 };
const BOTTOM_RIGHT = { x: 115, y: 115 };
const JUNCTION_DROP = 8;
const SPLIT_DURATION = 1600;
const RIPPLE_GAIN = 0.9;
const ZONED_CALM = 0.5;
const SWIRL_RADIUS = 24;
const SWIRL_RANGE = [0.25, 0.55] as const;
const REVEAL_DURATION = 2000;
const FLOOD_DURATION = 1300;
const RECEDE_DURATION = 1000;
const FLOOD_STYLES = [
  "fill-team-1 stroke-team-1",
  "fill-team-2 stroke-team-2",
  "fill-team-3 stroke-team-3",
  "fill-team-4 stroke-team-4",
];
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

const initialStates = (offset: number): WaveState[] =>
  WAVES.map(({ amplitude: [min, max] }, i) => ({
    amplitude: (min + max) / 2,
    phase: i * 2 + offset,
  }));

const createShape = (): Shape => ({
  waves: { x: initialStates(0), y: initialStates(1) },
  split3: 0,
  split4: 0,
  ripple: 0,
  swirl: (SWIRL_RANGE[0] + SWIRL_RANGE[1]) / 2,
});

const fmt = (n: number) => n.toFixed(2);
const pt = ({ x, y }: Point) => `${fmt(x)} ${fmt(y)}`;
const lerp = (a: Point, b: Point, t: number) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

function sway(states: WaveState[], position: number, gain: number) {
  return WAVES.reduce(
    (sum, { frequency }, w) =>
      sum +
      gain *
        states[w].amplitude *
        Math.sin(2 * Math.PI * frequency * (position / 100) + states[w].phase),
    0,
  );
}

function displace(p: Point, { waves, ripple, split3 }: Shape): Point {
  const gain = (1 + ripple * RIPPLE_GAIN) * (1 - ZONED_CALM * split3);
  return {
    x: p.x + sway(waves.x, p.y, gain),
    y: p.y + sway(waves.y, p.x, gain),
  };
}

function twist(p: Point, center: Point, angle: number): Point {
  if (angle === 0) return p;
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  const theta =
    angle * Math.exp(-(dx * dx + dy * dy) / (SWIRL_RADIUS * SWIRL_RADIUS));
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

function arm(shape: Shape, from: Point, to: Point, swirl: number): Arm {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  return {
    points: Array.from({ length: ARM_SAMPLES + 1 }, (_, i) =>
      displace(twist(lerp(from, to, i / ARM_SAMPLES), from, swirl), shape),
    ),
    far: {
      x: to.x + ((to.x - from.x) / length) * FAR,
      y: to.y + ((to.y - from.y) / length) * FAR,
    },
  };
}

function curveTo(p0: Point, p1: Point, p2: Point, p3: Point) {
  const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
  const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
  return `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
}

function curves(points: Point[]) {
  return points
    .slice(0, -1)
    .map((p1, i) =>
      curveTo(
        points[i - 1] ?? p1,
        p1,
        points[i + 1],
        points[i + 2] ?? points[i + 1],
      ),
    )
    .join("");
}

function zonePath(inward: Arm, outward: Arm, corners: Point[]) {
  const toJunction = [...inward.points].reverse();
  const closing = [outward.far, ...corners].map((p) => `L${pt(p)}`).join("");
  return `M${pt(inward.far)}L${pt(toJunction[0])}${curves(toJunction)}${curves(outward.points)}${closing}Z`;
}

function frame(shape: Shape) {
  const { split3, split4 } = shape;
  const junction = { x: 50, y: 50 + JUNCTION_DROP * split3 * (1 - split4) };
  const swirl = shape.swirl * split3;
  const reach = (to: Point) => arm(shape, junction, to, swirl);
  const corner = (dx: number, dy: number) => ({
    x: 50 + dx * OUTER,
    y: 50 + dy * OUTER,
  });
  return {
    reach,
    corner,
    topLeft: () => reach(lerp(TOP, TOP_LEFT, split3)),
    topRight: () => reach(lerp(TOP, TOP_RIGHT, split3)),
    bottomLeft: () => reach(lerp(BOTTOM, BOTTOM_LEFT, split4)),
    bottomRight: () => reach(lerp(BOTTOM, BOTTOM_RIGHT, split4)),
  };
}

function zonePaths(shape: Shape) {
  const { reach, corner, topLeft, topRight, bottomLeft, bottomRight } =
    frame(shape);
  const top = reach(TOP);
  const bottom = reach(BOTTOM);

  return {
    left: zonePath(bottom, top, [corner(-1, -1), corner(-1, 1)]),
    right: zonePath(top, bottom, [corner(1, 1), corner(1, -1)]),
    top:
      shape.split3 > 0
        ? zonePath(topLeft(), topRight(), [corner(1, -1), corner(-1, -1)])
        : "",
    bottom:
      shape.split4 > 0
        ? zonePath(bottomRight(), bottomLeft(), [corner(-1, 1), corner(1, 1)])
        : "",
  };
}

function teamZonePath(shape: Shape, team: number) {
  const { corner, topLeft, topRight, bottomLeft, bottomRight } = frame(shape);
  const zones = [
    () => zonePath(bottomLeft(), topLeft(), [corner(-1, -1), corner(-1, 1)]),
    () => zonePath(topRight(), bottomRight(), [corner(1, 1), corner(1, -1)]),
    () => zonePath(topLeft(), topRight(), [corner(1, -1), corner(-1, -1)]),
    () => zonePath(bottomRight(), bottomLeft(), [corner(-1, 1), corner(1, 1)]),
  ];
  return (zones[team] ?? zones[0])();
}

const INITIAL_PATHS = zonePaths(createShape());

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
  const outline = points.map((p1, i) =>
    curveTo(at(i - 1), p1, at(i + 1), at(i + 2)),
  );
  return `M${pt(points[0])}${outline.join("")}Z`;
}

export function WaveBackground({
  started = false,
  revealing = false,
  onRevealEnd,
  takeover = null,
  teams,
  children,
}: {
  started?: boolean;
  revealing?: boolean;
  onRevealEnd?: () => void;
  takeover?: number | null;
  teams?: number;
  children?: ReactNode;
}) {
  const shapeRef = useRef<Shape>(createShape());
  const floodRef = useRef<Flood>({ team: null, reach: 0 });
  const teamsRef = useRef(teams ?? MIN_TEAMS);
  const knownTeamsRef = useRef<number | undefined>(undefined);
  const inkPathRef = useRef<SVGPathElement>(null);
  const rightPathRef = useRef<SVGPathElement>(null);
  const topPathRef = useRef<SVGPathElement>(null);
  const bottomPathRef = useRef<SVGPathElement>(null);
  const floodPathRef = useRef<SVGPathElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<SVGSVGElement>(null);
  const blobRef = useRef<SVGPathElement>(null);

  const draw = useCallback(() => {
    const shape = shapeRef.current;
    const flood = floodRef.current;
    const paths = zonePaths(shape);
    inkPathRef.current?.setAttribute("d", paths.left);
    rightPathRef.current?.setAttribute("d", paths.right);
    topPathRef.current?.setAttribute("d", paths.top);
    bottomPathRef.current?.setAttribute("d", paths.bottom);
    const floodPath = floodPathRef.current;
    floodPath?.setAttribute(
      "d",
      flood.team === null ? "" : teamZonePath(shape, flood.team),
    );
    floodPath?.setAttribute("stroke-width", fmt(flood.reach * 2));
  }, []);

  useEffect(() => {
    teamsRef.current = teams ?? MIN_TEAMS;
  }, [teams]);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const shape = shapeRef.current;
    const animations: JSAnimation[] = [];

    const morph = (states: WaveState[], w: number, slot: number) => {
      const [min, max] = WAVES[w].amplitude;
      animations[slot] = animate(states[w], {
        amplitude: utils.random(min, max, 2),
        phase: states[w].phase + utils.random(-Math.PI, Math.PI, 2),
        duration: utils.random(4000, 8000),
        ease: "inOutSine",
        onComplete: () => morph(states, w, slot),
      });
    };
    [shape.waves.x, shape.waves.y].forEach((states, axis) =>
      states.forEach((_, w) => morph(states, w, axis * WAVES.length + w)),
    );

    const swirl = () => {
      animations[2 * WAVES.length] = animate(shape, {
        swirl: utils.random(SWIRL_RANGE[0], SWIRL_RANGE[1], 2),
        duration: utils.random(6000, 10000),
        ease: "inOutSine",
        onComplete: swirl,
      });
    };
    swirl();

    const renderer = createTimer({ onUpdate: draw });

    return () => {
      renderer.cancel();
      animations.forEach((animation) => animation.cancel());
    };
  }, [draw]);

  useEffect(() => {
    if (teams === undefined) return;

    const shape = shapeRef.current;
    const split3 = teams >= 3 ? 1 : 0;
    const split4 = teams >= 4 ? 1 : 0;
    const animated =
      knownTeamsRef.current !== undefined && !prefersReducedMotion();
    knownTeamsRef.current = teams;

    if (!animated) {
      shape.split3 = split3;
      shape.split4 = split4;
      draw();
      return;
    }

    const split = animate(shape, {
      split3,
      split4,
      duration: SPLIT_DURATION,
      ease: "inOutCubic",
      onUpdate: draw,
    });
    const ripple = animate(shape, {
      ripple: [
        { to: 1, duration: SPLIT_DURATION * 0.4, ease: "outQuad" },
        { to: 0, duration: SPLIT_DURATION * 0.6, ease: "inOutSine" },
      ],
    });

    return () => {
      split.cancel();
      ripple.cancel();
    };
  }, [teams, draw]);

  useEffect(() => {
    const reveal = revealRef.current;
    const path = floodPathRef.current;
    if (!reveal || !path) return;

    const flood = floodRef.current;
    if (takeover !== null && flood.team !== takeover) {
      flood.team = takeover;
      flood.reach = 0;
      path.setAttribute("class", FLOOD_STYLES[takeover] ?? FLOOD_STYLES[0]);
    }
    if (flood.team === null) return;

    const { width, height } = reveal.getBoundingClientRect();
    const { x, y } = zoneCenter(teamsRef.current, flood.team);
    const left = (x / 100) * width;
    const top = (y / 100) * height;
    const growing = takeover !== null;
    const animation = animate(flood, {
      reach: growing
        ? Math.hypot(Math.max(left, width - left), Math.max(top, height - top))
        : 0,
      duration: prefersReducedMotion()
        ? 0
        : growing
          ? FLOOD_DURATION
          : RECEDE_DURATION,
      ease: growing ? "inOutSine" : "inOutQuad",
      onUpdate: draw,
      onComplete: () => {
        if (growing) return;
        flood.team = null;
        draw();
      },
    });

    return () => {
      animation.cancel();
    };
  }, [takeover, draw]);

  useEffect(() => {
    const root = rootRef.current;
    const reveal = revealRef.current;
    const blob = blobRef.current;
    if (!revealing || !root || !reveal || !blob) return;

    const bounds = reveal.getBoundingClientRect();
    const { width, height } = bounds;
    const center = { x: width / 2, y: height / 2 };
    const origin = { x: bounds.left + center.x, y: bounds.top + center.y };
    const maxRadius = Math.hypot(width, height) / 2 / (1 - BLOB_WOBBLE_TOTAL);
    const growth = { radius: 0, time: 0 };
    const uncover = () => {
      const pending = root.querySelectorAll<HTMLElement>(
        "[data-reveal-cover]:not([data-covered])",
      );
      pending.forEach((element) => {
        const { left, right, top, bottom } = element.getBoundingClientRect();
        const dx = Math.max(
          Math.abs(left - origin.x),
          Math.abs(right - origin.x),
        );
        const dy = Math.max(
          Math.abs(top - origin.y),
          Math.abs(bottom - origin.y),
        );
        if (growth.radius * (1 - BLOB_WOBBLE_TOTAL) >= Math.hypot(dx, dy)) {
          element.dataset.covered = "";
        }
      });
    };
    const drawBlob = () => {
      blob.setAttribute("d", blobPath(center, growth.radius, growth.time));
      uncover();
    };
    drawBlob();

    const duration = prefersReducedMotion() ? 0 : REVEAL_DURATION;
    const animation = animate(growth, {
      radius: { to: maxRadius, ease: "inQuad" },
      time: { to: duration / 1000, ease: "linear" },
      duration,
      onUpdate: drawBlob,
      onComplete: () => onRevealEnd?.(),
    });

    return () => {
      animation.cancel();
      root
        .querySelectorAll<HTMLElement>("[data-covered]")
        .forEach((element) => delete element.dataset.covered);
    };
  }, [revealing, onRevealEnd]);

  return (
    <div ref={rootRef} className="relative min-h-dvh overflow-hidden bg-paper">
      <svg
        aria-hidden
        className="absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path ref={inkPathRef} className="fill-ink" d={INITIAL_PATHS.left} />
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
            <rect width="100" height="100" className="fill-team-1" />
            <path
              ref={rightPathRef}
              className="fill-team-2"
              d={INITIAL_PATHS.right}
            />
            <path ref={topPathRef} className="fill-team-3" />
            <path ref={bottomPathRef} className="fill-team-4" />
            <path
              ref={floodPathRef}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </g>
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
