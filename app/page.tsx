import { ScoreCounter } from "./_components/score-counter.tsx";
import { WaveBackground } from "./_components/wave-background.tsx";
import { APP_NAME, TEAMS } from "./_lib/config.ts";

export default function Home() {
  return (
    <main>
      <WaveBackground>
        <div className="grid min-h-dvh grid-cols-2 grid-rows-[auto_1fr] items-center gap-x-8 px-4 py-10 text-white sm:grid-cols-[1fr_auto_1fr] sm:grid-rows-1">
          <h1 className="col-span-2 text-center text-4xl font-bold tracking-tight sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:text-5xl">
            {APP_NAME}
          </h1>
          <ScoreCounter
            team={TEAMS[0]}
            className="sm:col-start-1 sm:row-start-1"
          />
          <ScoreCounter
            team={TEAMS[1]}
            className="sm:col-start-3 sm:row-start-1"
          />
        </div>
      </WaveBackground>
    </main>
  );
}
