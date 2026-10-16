export type ZoneCenter = { x: number; y: number };

export const ZONE_CENTERS: Record<number, ZoneCenter[]> = {
  2: [
    { x: 25, y: 50 },
    { x: 75, y: 50 },
  ],
  3: [
    { x: 20, y: 66 },
    { x: 80, y: 66 },
    { x: 50, y: 22 },
  ],
  4: [
    { x: 16, y: 50 },
    { x: 84, y: 50 },
    { x: 50, y: 19 },
    { x: 50, y: 80 },
  ],
};

export function zoneCenter(teams: number, team: number): ZoneCenter {
  return (ZONE_CENTERS[teams] ?? ZONE_CENTERS[2])[team] ?? { x: 50, y: 50 };
}
