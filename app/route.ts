import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createGame } from "./_lib/games.ts";

export async function GET() {
  await connection();
  redirect(`/${createGame()}`);
}
