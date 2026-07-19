"use client";

import { useEffect, useRef, useState } from "react";

const EMBED_ORIGIN = "https://pauseai.info";
const EMBED_URL = `${EMBED_ORIGIN}/embed/onboarding-form/?country=United+Kingdom&bg=FDF8F3`;
const DEFAULT_HEIGHT = 0;
const SETTLE_DELAY_MS = 400;

export default function OnboardingFormEmbed() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const settledRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== EMBED_ORIGIN) return;
      const data = event.data;
      if (typeof data?.height === "number") {
        // The embed reports height in a burst while it settles on load (fonts,
        // layout, etc.) before any user interaction. Only treat a height
        // decrease as a real step-advance once those messages have gone quiet.
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = setTimeout(() => {
          settledRef.current = true;
        }, SETTLE_DELAY_MS);

        setHeight((prev) => {
          if (settledRef.current && data.height < prev && iframeRef.current) {
            iframeRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          return data.height;
        });
      }
    }
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(settleTimerRef.current);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src={EMBED_URL}
      width="100%"
      height={height}
      frameBorder={0}
      marginHeight={0}
      marginWidth={0}
      title="Get involved!"
      style={{ transition: "height 0.2s ease" }}
    />
  );
}
