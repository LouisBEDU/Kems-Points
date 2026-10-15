"use server";

import { TEAMS } from "./config.ts";
import { updateScore } from "./scores.ts";

export async function changeScore(team: number, delta: number) {
  if (!Number.isInteger(team) || team < 0 || team >= TEAMS.length) {
    throw new Error("Équipe inconnue");
  }
  if (delta !== 1 && delta !== -1) {
    throw new Error("Variation de score invalide");
  }
  await updateScore(team, delta);
}
