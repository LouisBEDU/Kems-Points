"use server";

import { TEAMS } from "./config.ts";
import { getGameState, hasSession, openSession, updateScore } from "./games.ts";
import { saveSession, sessionToken } from "./session.ts";

const MIN_PASSWORD_LENGTH = 4;
const MAX_PASSWORD_LENGTH = 128;

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

export async function changeScore(gameId: string, team: number, delta: number) {
  if (!hasSession(gameId, await sessionToken())) {
    throw new Error("Accès refusé");
  }
  if (!Number.isInteger(team) || team < 0 || team >= TEAMS.length) {
    throw new Error("Équipe inconnue");
  }
  if (delta !== 1 && delta !== -1) {
    throw new Error("Variation de score invalide");
  }
  updateScore(gameId, team, delta);
}
