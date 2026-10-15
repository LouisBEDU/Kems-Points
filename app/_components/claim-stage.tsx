"use client";

import { animate, createTimeline, type JSAnimation, utils } from "animejs";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  type Claim,
  CLAIM_KINDS,
  opponentOf,
  PENALTY_POINTS,
} from "../_lib/claims.ts";
import { prefersReducedMotion } from "../_lib/motion.ts";

const BADGE_COLORS = ["text-team-1", "text-team-2"];
const SETTLE = { x: 0, y: 0, rotate: 0, duration: 150, ease: "outQuad" };

export function ClaimStage({
  claim,
  score,
  teamNames,
  onResolve,
  onDone,
}: {
  claim: Claim;
  score: number;
  teamNames: string[];
  onResolve?: (confirmed: boolean) => Promise<void>;
  onDone: () => void;
}) {
  const { label, points, penalty } = CLAIM_KINDS[claim.kind];
  const badgeRef = useRef<HTMLSpanElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const [landed, setLanded] = useState(false);
  const [sending, startSending] = useTransition();

  const pending = claim.status === "pending";
  const shown =
    claim.status === "confirmed" && !landed ? score - points : score;
  const team = teamNames[claim.team];
  const opponent = teamNames[opponentOf(claim.team)];
  const outcome =
    claim.status === "confirmed"
      ? `+${points} pour ${team}`
      : claim.status === "rejected"
        ? penalty
          ? `Refusé · +${PENALTY_POINTS} pour ${opponent}`
          : "Refusé"
        : null;

  useEffect(() => {
    const number = numberRef.current;
    if (!pending || !number || prefersReducedMotion()) return;

    let jitter: JSAnimation;
    const shake = () => {
      jitter = animate(number, {
        x: utils.random(-8, 8, 1),
        y: utils.random(-5, 5, 1),
        rotate: utils.random(-3, 3, 1),
        duration: utils.random(80, 160),
        ease: "inOutSine",
        onComplete: shake,
      });
    };
    shake();

    return () => {
      jitter.cancel();
    };
  }, [pending]);

  useEffect(() => {
    const badge = badgeRef.current;
    const number = numberRef.current;
    if (claim.status === "pending" || !badge || !number) return;

    const timeline = createTimeline().add(number, SETTLE, 0);
    if (claim.status === "confirmed") {
      const from = badge.getBoundingClientRect();
      const to = number.getBoundingClientRect();
      timeline
        .add(
          badge,
          {
            x: to.left + to.width / 2 - (from.left + from.width / 2),
            y: to.top + to.height / 2 - (from.top + from.height / 2),
            scale: 0.4,
            duration: 450,
            ease: "inBack",
          },
          0,
        )
        .call(() => setLanded(true))
        .add(badge, { opacity: 0, duration: 80 }, "<")
        .add(
          number,
          {
            scale: [
              { to: 0.8, duration: 120 },
              { to: 1.25, duration: 220 },
              { to: 1, duration: 320 },
            ],
            ease: "outQuad",
          },
          "<<",
        )
        .call(onDone, "+=1000");
    } else {
      const direction = claim.team === 0 ? 1 : -1;
      timeline
        .add(
          badge,
          {
            x: penalty ? direction * 260 : 0,
            y: -320,
            rotate: direction * 35,
            opacity: 0,
            duration: 900,
            ease: "outCubic",
          },
          0,
        )
        .call(onDone, "+=1300");
    }

    return () => {
      timeline.cancel();
    };
  }, [claim.status, claim.team, penalty, onDone]);

  return (
    <div className="flex min-h-dvh animate-fade-in flex-col items-center justify-center gap-8 px-4 py-10 text-center text-white [animation-delay:300ms]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
          {team}
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">
          {label} !
        </h1>
      </div>
      <div className="relative px-12 pt-6">
        <span
          ref={badgeRef}
          className={`absolute left-0 top-0 rounded-full bg-white px-3 py-1 text-2xl font-black shadow-lg ${BADGE_COLORS[claim.team]}`}
        >
          +{points}
        </span>
        <span
          ref={numberRef}
          className="block text-[9rem] font-bold leading-none tabular-nums sm:text-[12rem]"
        >
          {shown}
        </span>
      </div>
      {outcome && (
        <p className="animate-fade-in text-xl font-semibold">{outcome}</p>
      )}
      {pending && onResolve && (
        <div className="flex gap-3">
          <button
            type="button"
            disabled={sending}
            onClick={() => startSending(() => onResolve(true))}
            className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-ink transition enabled:active:scale-95 disabled:opacity-60"
          >
            Valider
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={() => startSending(() => onResolve(false))}
            className="rounded-2xl bg-white/15 px-8 py-4 text-lg font-bold transition enabled:active:scale-95 disabled:opacity-60"
          >
            Refuser
          </button>
        </div>
      )}
      {pending && !onResolve && (
        <p className="animate-pulse text-white/80">En attente de validation…</p>
      )}
    </div>
  );
}
