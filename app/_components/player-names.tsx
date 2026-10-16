import { TEAM_HALO, TEAM_ON } from "../_lib/teams.ts";

type Zone = {
  x: number;
  y: number;
  axis: "x" | "y";
  spread: number;
  jitter: [number, number];
};

const ZONES: Record<number, Zone[]> = {
  2: [
    { x: 25, y: 50, axis: "y", spread: 56, jitter: [16, 20] },
    { x: 75, y: 50, axis: "y", spread: 56, jitter: [16, 20] },
  ],
  3: [
    { x: 20, y: 68, axis: "y", spread: 30, jitter: [10, 8] },
    { x: 80, y: 68, axis: "y", spread: 30, jitter: [10, 8] },
    { x: 50, y: 18, axis: "x", spread: 34, jitter: [8, 8] },
  ],
  4: [
    { x: 15, y: 50, axis: "y", spread: 30, jitter: [10, 8] },
    { x: 85, y: 50, axis: "y", spread: 30, jitter: [10, 8] },
    { x: 50, y: 15, axis: "x", spread: 34, jitter: [8, 8] },
    { x: 50, y: 85, axis: "x", spread: 34, jitter: [8, 8] },
  ],
};

function seededUnits(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  hash >>>= 0;
  return [(hash & 0xffff) / 0xffff, (hash >>> 16) / 0xffff];
}

function spot(
  gameId: string,
  team: number,
  slot: number,
  teams: number,
  slots: number,
) {
  const [rx, ry] = seededUnits(`${gameId}:${team}:${slot}`);
  const zone = (ZONES[teams] ?? ZONES[2])[team];
  const along = slots === 1 ? 0 : (slot / (slots - 1) - 0.5) * zone.spread;
  const x =
    zone.x + (zone.axis === "x" ? along : 0) + (rx - 0.5) * zone.jitter[0];
  const y =
    zone.y + (zone.axis === "y" ? along : 0) + (ry - 0.5) * zone.jitter[1];
  return { left: `${x}%`, top: `${y}%` };
}

export function PlayerNames({
  gameId,
  players,
}: {
  gameId: string;
  players: string[][];
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {players.map((team, t) =>
        team.map((name, slot) => {
          const label = name.trim();
          if (!label) return null;
          return (
            <span
              key={`${t}-${slot}`}
              className={`absolute max-w-[28vw] -translate-x-1/2 -translate-y-1/2 animate-fade-in wrap-break-word text-center text-3xl font-black sm:text-5xl ${TEAM_ON[t]} ${TEAM_HALO[t]}`}
              style={spot(gameId, t, slot, players.length, team.length)}
            >
              {label}
            </span>
          );
        }),
      )}
    </div>
  );
}
