"use client";

import { useEffect, useState } from "react";

export default function FullscreenMessageManager() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useBodyAriaHidden(isFullscreen);

  return (
    <>
      <button onClick={() => setIsFullscreen(!isFullscreen)}>
        {isFullscreen ? "Close Fullscreen" : "Open Fullscreen"}
      </button>

      {isFullscreen && (
        <div
          className="fixed inset-0 bg-white z-50 p-8"
          role="dialog"
          aria-modal="true"
        >
          <button onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? "Close Fullscreen" : "Open Fullscreen"}
          </button>
          <p>This message takes over the screen.</p>
        </div>
      )}
    </>
  );
}

function useBodyAriaHidden(isHidden) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const body = document.body;

    if (isHidden) {
      body.setAttribute("aria-hidden", "true");
    } else {
      body.removeAttribute("aria-hidden");
    }

    // Cleanup on unmount or state change
    return () => {
      body.removeAttribute("aria-hidden");
    };
  }, [isHidden]);
}
