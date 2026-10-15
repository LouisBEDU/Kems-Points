import { TEAMS } from "./config.ts";

export const PLAYERS_PER_TEAM = 2;
export const MAX_PLAYER_NAME_LENGTH = 20;

export function teamNames(players: readonly (readonly string[])[]) {
  return TEAMS.map((fallback, team) => {
    const names = (players[team] ?? [])
      .map((name) => name.trim())
      .filter(Boolean);
    return names.length > 0 ? names.join(" & ") : fallback;
  });
}

export function winnersOf(scores: readonly number[]) {
  const best = Math.max(...scores);
  return scores.flatMap((score, team) => (score === best ? [team] : []));
}
