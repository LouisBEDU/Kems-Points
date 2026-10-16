type Pose = { x: number; y: number; rotate: number };

const POSES: Record<string, Pose> = {
  "0": { x: -0.17, y: 0.055, rotate: 35 },
  "1": { x: -0.27, y: 0.09, rotate: 12 },
  "2": { x: -0.28, y: 0.015, rotate: 3 },
  "3": { x: -0.36, y: 0.013, rotate: -6 },
  "4": { x: -0.215, y: 0.15, rotate: 12 },
  "5": { x: -0.45, y: 0.105, rotate: -75 },
  "6": { x: -0.18, y: 0.04, rotate: 20 },
  "7": { x: -0.27, y: 0.011, rotate: 0 },
  "8": { x: -0.41, y: 0.06, rotate: -35 },
  "9": { x: -0.175, y: 0.06, rotate: 35 },
};

export function LeaderCrown({ digit }: { digit: string }) {
  const { x, y, rotate } = POSES[digit] ?? POSES["0"];

  return (
    <span
      role="img"
      aria-label="En tête"
      className="pointer-events-none absolute left-full top-0 w-[0.3em] origin-bottom transition-transform duration-500 ease-out"
      style={{
        transform: `translate(calc(-50% + ${x}em), calc(-100% + ${y}em)) rotate(${rotate}deg)`,
      }}
    >
      <svg
        viewBox="0 0 40 30"
        className="block w-full origin-bottom drop-shadow-[0_0.02em_0.03em_rgb(0_0_0/0.35)] motion-safe:animate-crown-drop"
      >
        <path className="fill-gold" d="M6 25 4 10l9 7 7-12 7 12 9-7-2 15Z" />
        <rect
          className="fill-gold-dark"
          x="5"
          y="23"
          width="30"
          height="6"
          rx="1.5"
        />
        <circle className="fill-gold" cx="4" cy="8.5" r="2.5" />
        <circle className="fill-gold" cx="20" cy="4" r="3" />
        <circle className="fill-gold" cx="36" cy="8.5" r="2.5" />
      </svg>
    </span>
  );
}
