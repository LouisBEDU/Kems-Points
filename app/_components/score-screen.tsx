import type { ReactNode } from "react";
import { APP_NAME } from "../_lib/config.ts";
import { Scoreboard } from "./scoreboard.tsx";
import { WaveBackground } from "./wave-background.tsx";

export function ScoreScreen({
  editable = false,
  children,
}: {
  editable?: boolean;
  children?: ReactNode;
}) {
  return (
    <main>
      <WaveBackground>
        <div className="grid min-h-dvh grid-cols-2 grid-rows-[auto_1fr] items-center gap-x-8 gap-y-10 px-4 py-10 text-white sm:grid-cols-[1fr_auto_1fr] sm:grid-rows-1">
          <div className="col-span-2 flex flex-col items-center gap-8 sm:col-span-1 sm:col-start-2 sm:row-start-1">
            <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">
              {APP_NAME}
            </h1>
            {children}
          </div>
          <Scoreboard editable={editable} />
        </div>
      </WaveBackground>
    </main>
  );
}
