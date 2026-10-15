"use client";

import { useSyncExternalStore } from "react";

const EXPAND_PATH = "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5";
const COLLAPSE_PATH = "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5";

function subscribe(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

const isFullscreen = () => document.fullscreenElement !== null;
const isSupported = () => document.fullscreenEnabled;
const onServer = () => false;

function toggleFullscreen() {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void document.documentElement.requestFullscreen();
  }
}

export function FullscreenButton() {
  const fullscreen = useSyncExternalStore(subscribe, isFullscreen, onServer);
  const supported = useSyncExternalStore(subscribe, isSupported, onServer);
  if (!supported) return null;

  const label = fullscreen ? "Quitter le plein écran" : "Plein écran";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={toggleFullscreen}
      className="fixed right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-ink/60 text-white transition hover:bg-ink/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-5 fill-none stroke-current stroke-2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={fullscreen ? COLLAPSE_PATH : EXPAND_PATH} />
      </svg>
    </button>
  );
}
