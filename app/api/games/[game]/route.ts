import { connection } from "next/server";
import {
  type GameState,
  getGameState,
  subscribe,
} from "../../../_lib/games.ts";

const encoder = new TextEncoder();
const toEvent = (state: GameState) =>
  encoder.encode(`data: ${JSON.stringify(state)}\n\n`);

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

  let unsubscribe = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(toEvent(initial));
      unsubscribe = subscribe(id, (state) =>
        controller.enqueue(toEvent(state)),
      );
      request.signal.addEventListener("abort", () => unsubscribe());
    },
    cancel() {
      unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
