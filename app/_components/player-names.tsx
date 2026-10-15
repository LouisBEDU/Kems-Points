const ZONE_WIDTH = 16;
const BAND_HEIGHT = 20;

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
  const zoneCenter = ((team + 0.5) / teams) * 100;
  const bandCenter = slots === 1 ? 50 : 22 + (slot * 56) / (slots - 1);
  return {
    left: `${zoneCenter + (rx - 0.5) * ZONE_WIDTH}%`,
    top: `${bandCenter + (ry - 0.5) * BAND_HEIGHT}%`,
  };
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
              className="absolute max-w-[34vw] -translate-x-1/2 -translate-y-1/2 animate-fade-in wrap-break-word text-center text-3xl font-black text-white mix-blend-difference sm:text-5xl"
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
