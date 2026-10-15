import { headers } from "next/headers";
import { Suspense } from "react";
import { ManageQrCode } from "./_components/manage-qr-code.tsx";
import { ScoreScreen } from "./_components/score-screen.tsx";
import { publicOrigin } from "./_lib/network.ts";

async function ManageLink() {
  const requestHeaders = await headers();
  const origin = publicOrigin(
    requestHeaders.get("host") ?? "localhost:3000",
    requestHeaders.get("x-forwarded-proto") ?? "http",
  );
  return <ManageQrCode url={`${origin}/gestion`} />;
}

export default function Home() {
  return (
    <ScoreScreen>
      <Suspense fallback={<ManageQrCode />}>
        <ManageLink />
      </Suspense>
    </ScoreScreen>
  );
}
