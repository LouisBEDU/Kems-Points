import { Buffer } from "node:buffer";
import { randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import { TEAMS } from "./config.ts";

export type GameState = { name: string; started: boolean; scores: number[] };
type Listener = (state: GameState) => void;
type Game = GameState & {
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
const GAME_TTL = 24 * 60 * 60 * 1000;

const shared = globalThis as typeof globalThis & {
  kemsGames?: Map<string, Game>;
};
const games = (shared.kemsGames ??= new Map());

const pick = <T>(items: readonly T[]) => items[randomInt(items.length)];

function hashPassword(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, 32, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );
}

function snapshot({ name, started, scores }: Game): GameState {
  return { name, started, scores: [...scores] };
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
    started: false,
    scores: TEAMS.map(() => 0),
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
    game.started = true;
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

export function updateScore(id: string, team: number, delta: number) {
  const game = games.get(id);
  if (!game?.started) return;
  game.scores[team] = Math.max(0, game.scores[team] + delta);
  notify(game);
}
