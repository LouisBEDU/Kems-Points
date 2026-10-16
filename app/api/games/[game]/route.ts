import { connection } from "next/server";
import { HEARTBEAT_INTERVAL } from "../../../_lib/config.ts";
import {
  type GameState,
  getGameState,
  subscribe,
} from "../../../_lib/games.ts";

const encoder = new TextEncoder();
const toEvent = (state: GameState) =>
  encoder.encode(`data: ${JSON.stringify(state)}\n\n`);
const heartbeat = encoder.encode("event: ping\ndata: ping\n\n");

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/games/[game]">,
) {
  await connection();
  const { game: id } = await params;
  const initial = getGameState(id);
  if (!initial) {
    return new Response(null, { status: 404 });
  }

  let stop = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(toEvent(initial));
      const unsubscribe = subscribe(id, (state) =>
        controller.enqueue(toEvent(state)),
      );
      const timer = setInterval(() => {
        try {
          controller.enqueue(heartbeat);
        } catch {
          stop();
        }
      }, HEARTBEAT_INTERVAL);
      stop = () => {
        clearInterval(timer);
        unsubscribe();
      };
      request.signal.addEventListener("abort", () => stop());
    },
    cancel() {
      stop();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
