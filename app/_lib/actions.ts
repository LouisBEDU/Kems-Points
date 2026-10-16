"use server";

import { isClaimKind } from "./claims.ts";
import { MAX_TEAMS, MIN_TEAMS } from "./config.ts";
import {
  adjustScore,
  declareClaim,
  draftPlayerName,
  finishGame,
  getGameState,
  hasSession,
  launchGame,
  openSession,
  resolveClaim,
  setTeamCount,
  teamCount,
} from "./games.ts";
import { saveSession, sessionToken } from "./session.ts";
import { MAX_PLAYER_NAME_LENGTH, PLAYERS_PER_TEAM } from "./teams.ts";

const MIN_PASSWORD_LENGTH = 4;
const MAX_PASSWORD_LENGTH = 128;

async function assertSession(gameId: string) {
  if (!hasSession(gameId, await sessionToken())) {
    throw new Error("Accès refusé");
  }
}

function assertTeam(gameId: string, team: number) {
  if (!Number.isInteger(team) || team < 0 || team >= teamCount(gameId)) {
    throw new Error("Équipe inconnue");
  }
}

export async function enterGame(
  gameId: string,
  _previousError: string | null,
  formData: FormData,
): Promise<string | null> {
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return `Le mot de passe doit faire entre ${MIN_PASSWORD_LENGTH} et ${MAX_PASSWORD_LENGTH} caractères.`;
  }
  if (!getGameState(gameId)) {
    return "Cette partie n'existe plus.";
  }

  const token = await openSession(gameId, password);
  if (!token) {
    return "Mot de passe incorrect.";
  }
  await saveSession(gameId, token);
  return null;
}

export async function startGame(
  gameId: string,
  _previousError: string | null,
  formData: FormData,
): Promise<string | null> {
  await assertSession(gameId);
  const players = Array.from({ length: teamCount(gameId) }, (_, team) =>
    Array.from({ length: PLAYERS_PER_TEAM }, (_, slot) => {
      const value = formData.get(`player-${team}-${slot}`);
      return typeof value === "string" ? value.trim() : "";
    }),
  );
  if (
    players
      .flat()
      .some((name) => name.length === 0 || name.length > MAX_PLAYER_NAME_LENGTH)
  ) {
    return `Indique les ${PLAYERS_PER_TEAM} joueurs de chaque équipe (${MAX_PLAYER_NAME_LENGTH} caractères max).`;
  }
  launchGame(gameId, players);
  return null;
}

export async function changeTeamCount(gameId: string, count: number) {
  await assertSession(gameId);
  if (!Number.isInteger(count) || count < MIN_TEAMS || count > MAX_TEAMS) {
    throw new Error("Nombre d'équipes invalide");
  }
  setTeamCount(gameId, count);
}

export async function draftPlayer(
  gameId: string,
  team: number,
  slot: number,
  name: string,
) {
  await assertSession(gameId);
  assertTeam(gameId, team);
  if (!Number.isInteger(slot) || slot < 0 || slot >= PLAYERS_PER_TEAM) {
    throw new Error("Joueur inconnu");
  }
  if (typeof name !== "string") {
    throw new Error("Nom invalide");
  }
  draftPlayerName(gameId, team, slot, name.slice(0, MAX_PLAYER_NAME_LENGTH));
}

export async function correctScore(
  gameId: string,
  team: number,
  delta: number,
) {
  await assertSession(gameId);
  assertTeam(gameId, team);
  if (delta !== 1 && delta !== -1) {
    throw new Error("Correction invalide");
  }
  adjustScore(gameId, team, delta);
}

export async function declareKems(gameId: string, team: number, kind: string) {
  await assertSession(gameId);
  assertTeam(gameId, team);
  if (!isClaimKind(kind)) {
    throw new Error("Type de Kem's inconnu");
  }
  declareClaim(gameId, team, kind);
}

export async function resolveKems(gameId: string, confirmed: boolean) {
  await assertSession(gameId);
  if (typeof confirmed !== "boolean") {
    throw new Error("Réponse invalide");
  }
  resolveClaim(gameId, confirmed);
}

export async function endGame(gameId: string) {
  await assertSession(gameId);
  finishGame(gameId);
}
