"use client";

import { useEffect, useRef } from "react";

const QR_SIZE = 160;

export function ManageQrCode({
  url,
  caption,
}: {
  url: string;
  caption: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      if (cancelled) return;
      const ink = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-ink")
        .trim();
      new QRCodeStyling({
        type: "svg",
        width: QR_SIZE,
        height: QR_SIZE,
        margin: 0,
        data: url,
        qrOptions: { errorCorrectionLevel: "Q" },
        dotsOptions: { type: "rounded", color: ink },
        cornersSquareOptions: { type: "extra-rounded", color: ink },
        cornersDotOptions: { type: "dot", color: ink },
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
      className="flex flex-col items-center gap-3 rounded-3xl bg-white p-4 text-sm font-medium text-ink shadow-xl"
    >
      <div ref={containerRef} className="size-40" />
      {caption}
    </a>
  );
}
