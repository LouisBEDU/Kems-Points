import { cookies } from "next/headers";

const SESSION_COOKIE = "kems_session";
const SESSION_MAX_AGE = 60 * 60 * 24;

export async function sessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function saveSession(gameId: string, token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: `/${gameId}`,
    maxAge: SESSION_MAX_AGE,
  });
}
