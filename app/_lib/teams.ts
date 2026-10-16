import { TEAMS } from "./config.ts";

export const PLAYERS_PER_TEAM = 2;
export const MAX_PLAYER_NAME_LENGTH = 20;
export const TEAM_TEXT = [
  "text-team-1",
  "text-team-2",
  "text-team-3",
  "text-team-4",
];
export const TEAM_BG = ["bg-team-1", "bg-team-2", "bg-team-3", "bg-team-4"];
export const TEAM_ON = [
  "text-white",
  "text-white",
  "text-white",
  "text-white text-shadow-lg/40",
];
export const TEAM_HALO = [
  "text-shadow-lg/40",
  "text-shadow-lg/40",
  "text-shadow-lg/40",
  "",
];

export function teamNames(players: readonly (readonly string[])[]) {
  return players.map((team, index) => {
    const names = team.map((name) => name.trim()).filter(Boolean);
    return names.length > 0 ? names.join(" & ") : TEAMS[index];
  });
}

export function winnersOf(scores: readonly number[]) {
  const best = Math.max(...scores);
  return scores.flatMap((score, team) => (score === best ? [team] : []));
}
