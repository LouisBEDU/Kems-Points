import { TEAMS } from "./config.ts";

export const CLAIM_KINDS = {
  kems: { label: "Kem's", points: 1, penalty: true },
  double: { label: "Double Kem's", points: 2, penalty: true },
  contre: { label: "Contre Kem's", points: 1, penalty: false },
} as const;

export const CLAIM_ORDER = ["kems", "double", "contre"] as const;
export const PENALTY_POINTS = 1;

export type ClaimKind = keyof typeof CLAIM_KINDS;
export type Claim = {
  id: number;
  team: number;
  kind: ClaimKind;
  status: "pending" | "confirmed" | "rejected";
};

export function isClaimKind(value: unknown): value is ClaimKind {
  return typeof value === "string" && Object.hasOwn(CLAIM_KINDS, value);
}

export function opponentOf(team: number) {
  return (team + 1) % TEAMS.length;
}
