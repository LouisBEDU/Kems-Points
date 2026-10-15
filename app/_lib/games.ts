import { Buffer } from "node:buffer";
import { randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import {
  type Claim,
  CLAIM_KINDS,
  type ClaimKind,
  opponentOf,
  PENALTY_POINTS,
} from "./claims.ts";
import { TEAMS } from "./config.ts";
import { PLAYERS_PER_TEAM } from "./teams.ts";

export type GamePhase = "waiting" | "setup" | "playing" | "finished";
export type GameState = {
  name: string;
  phase: GamePhase;
  players: string[][];
  scores: number[];
  claim: Claim | null;
};
type Listener = (state: GameState) => void;
type Game = GameState & {
  claimCount: number;
  password: { salt: Buffer; hash: Promise<Buffer> } | null;
  sessions: Set<string>;
  listeners: Set<Listener>;
  updatedAt: number;
};

const ANIMALS = [
  "Renard",
  "Loup",
  "Hibou",
  "Panda",
  "Lynx",
  "Ours",
  "Aigle",
  "Tigre",
  "Castor",
  "Faucon",
];
const TRAITS = [
  "Rusé",
  "Rapide",
  "Joyeux",
  "Malin",
  "Brave",
  "Fougueux",
  "Sage",
  "Farceur",
];
const GAME_TTL = 6 * 60 * 60 * 1000;

const shared = globalThis as typeof globalThis & {
  kemsGames?: Map<string, Game>;
};
const games: Map<string, Game> = (shared.kemsGames ??= new Map());

const pick = <T>(items: readonly T[]) => items[randomInt(items.length)];

function hashPassword(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, 32, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );
}

function snapshot({ name, phase, players, scores, claim }: Game): GameState {
  return {
    name,
    phase,
    players: players.map((team) => [...team]),
    scores: [...scores],
    claim: claim && { ...claim },
  };
}

function notify(game: Game) {
  game.updatedAt = Date.now();
  const state = snapshot(game);
  for (const listener of game.listeners) {
    try {
      listener(state);
    } catch {
      game.listeners.delete(listener);
    }
  }
}

export function createGame() {
  const now = Date.now();
  for (const [id, game] of games) {
    if (now - game.updatedAt > GAME_TTL) games.delete(id);
  }

  let name: string;
  let id: string;
  do {
    name = `${pick(ANIMALS)} ${pick(TRAITS)} ${randomInt(10, 100)}`;
    id = Buffer.from(name).toString("base64url");
  } while (games.has(id));

  games.set(id, {
    name,
    phase: "waiting",
    players: TEAMS.map(() =>
      Array.from({ length: PLAYERS_PER_TEAM }, () => ""),
    ),
    scores: TEAMS.map(() => 0),
    claim: null,
    claimCount: 0,
    password: null,
    sessions: new Set(),
    listeners: new Set(),
    updatedAt: now,
  });
  return id;
}

export function getGameState(id: string) {
  const game = games.get(id);
  return game && snapshot(game);
}

export function subscribe(id: string, listener: Listener) {
  const game = games.get(id);
  game?.listeners.add(listener);
  return () => {
    game?.listeners.delete(listener);
  };
}

export async function openSession(id: string, password: string) {
  const game = games.get(id);
  if (!game) return null;

  if (game.password) {
    const { salt, hash } = game.password;
    const candidate = await hashPassword(password, salt);
    if (!timingSafeEqual(candidate, await hash)) return null;
  } else {
    const salt = randomBytes(16);
    game.password = { salt, hash: hashPassword(password, salt) };
    game.phase = "setup";
    notify(game);
    await game.password.hash;
  }

  const token = randomBytes(32).toString("base64url");
  game.sessions.add(token);
  return token;
}

export function hasSession(id: string, token: string | undefined) {
  return token !== undefined && !!games.get(id)?.sessions.has(token);
}

export function draftPlayerName(
  id: string,
  team: number,
  slot: number,
  name: string,
) {
  const game = games.get(id);
  if (game?.phase !== "setup") return;
  game.players[team][slot] = name;
  notify(game);
}

export function launchGame(id: string, players: string[][]) {
  const game = games.get(id);
  if (game?.phase !== "setup") return;
  game.players = players;
  game.phase = "playing";
  notify(game);
}

export function adjustScore(id: string, team: number, delta: number) {
  const game = games.get(id);
  if (game?.phase !== "playing") return;
  game.scores[team] = Math.max(0, game.scores[team] + delta);
  notify(game);
}

export function declareClaim(id: string, team: number, kind: ClaimKind) {
  const game = games.get(id);
  if (game?.phase !== "playing" || game.claim?.status === "pending") return;
  game.claimCount += 1;
  game.claim = { id: game.claimCount, team, kind, status: "pending" };
  notify(game);
}

export function resolveClaim(id: string, confirmed: boolean) {
  const game = games.get(id);
  const claim = game?.claim;
  if (!game || claim?.status !== "pending") return;

  const { points, penalty } = CLAIM_KINDS[claim.kind];
  if (confirmed) {
    game.scores[claim.team] += points;
  } else if (penalty) {
    game.scores[opponentOf(claim.team)] += PENALTY_POINTS;
  }
  claim.status = confirmed ? "confirmed" : "rejected";
  notify(game);
}

export function finishGame(id: string) {
  const game = games.get(id);
  if (game?.phase !== "playing" || game.claim?.status === "pending") return;
  game.phase = "finished";
  notify(game);
}
