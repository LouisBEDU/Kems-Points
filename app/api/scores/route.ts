import { connection } from "next/server";
import { getScores, type Scores, subscribe } from "../../_lib/scores.ts";

const encoder = new TextEncoder();
const toEvent = (scores: Scores) =>
  encoder.encode(`data: ${JSON.stringify(scores)}\n\n`);

export async function GET(request: Request) {
  await connection();

  let unsubscribe = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(toEvent(getScores()));
      unsubscribe = subscribe((scores) => controller.enqueue(toEvent(scores)));
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
