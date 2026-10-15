"use client";

import { useEffect, useRef } from "react";

const QR_SIZE = 160;

export function ManageQrCode({ url }: { url?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!url || !container) return;

    let cancelled = false;
    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      if (cancelled) return;
      const styles = getComputedStyle(document.documentElement);
      const team1 = styles.getPropertyValue("--color-team-1").trim();
      const team2 = styles.getPropertyValue("--color-team-2").trim();
      new QRCodeStyling({
        type: "svg",
        width: QR_SIZE,
        height: QR_SIZE,
        margin: 0,
        data: url,
        qrOptions: { errorCorrectionLevel: "Q" },
        dotsOptions: {
          type: "rounded",
          gradient: {
            type: "linear",
            rotation: Math.PI / 4,
            colorStops: [
              { offset: 0, color: team1 },
              { offset: 1, color: team2 },
            ],
          },
        },
        cornersSquareOptions: { type: "extra-rounded", color: team1 },
        cornersDotOptions: { type: "dot", color: team2 },
        backgroundOptions: { color: "#ffffff" },
      }).append(container);
    });

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [url]);

  return (
    <a
      href={url}
      className="flex flex-col items-center gap-3 rounded-3xl bg-white p-4 text-sm font-medium text-team-1 shadow-xl"
    >
      <div ref={containerRef} className="size-40" />
      Scanne pour gérer les points
    </a>
  );
}
