import { SceneFallback } from "../_components/game-scene.tsx";

export default function GameNotFound() {
  return (
    <div className="relative">
      <SceneFallback />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-white mix-blend-difference">
          Cette partie n&apos;existe pas ou plus
        </h1>
        <form action="/">
          <button
            type="submit"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-ink shadow-xl"
          >
            Nouvelle partie
          </button>
        </form>
      </div>
    </div>
  );
}
