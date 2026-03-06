import { useState, useEffect, useRef, useMemo } from "react";

export function useSmoothStream(rawText, status, options = {}) {
  const {
    // You can define which boundaries trigger an update here.
    // Default: Newlines
    boundaries = /\n+/gu,
  } = options;

  const [displayedText, setDisplayedText] = useState(rawText || "");

  useEffect(() => {
    // 1. No-op if not reading: instantly show all text
    if (status !== "reading") {
      setDisplayedText(rawText || "");
      return;
    }

    if (!rawText) return;

    setDisplayedText((prevDisplayed) => {
      // Reset if the stream restarted or was cleared
      if (rawText.length < prevDisplayed.length) {
        return rawText;
      }

      // Calculate the safe chunk index based on logical markdown blocks
      let safeIndex = 0;
      let inCodeBlock = false;
      let inMathBlock = false;

      const lines = rawText.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        let wasInCodeBlock = inCodeBlock;
        let wasInMathBlock = inMathBlock;

        // Toggle code block state
        if (line.trim().startsWith("```")) {
          inCodeBlock = !inCodeBlock;
        }

        // Toggle math block state
        if (line.trim().startsWith("$$")) {
          inMathBlock = !inMathBlock;
        }

        const currentLength =
          lines.slice(0, i + 1).join("\n").length +
          (i < lines.length - 1 ? 1 : 0);

        // A boundary is reached when:
        // 1. A code block just closed
        // 2. A math block just closed
        // 3. We are not inside any block, and it's an empty line (paragraph separator)
        const codeBlockClosed = wasInCodeBlock && !inCodeBlock;
        const mathBlockClosed = wasInMathBlock && !inMathBlock;
        const emptyLine = !inCodeBlock && !inMathBlock && line.trim() === "";

        // We no longer blindly mark the last streamed line as safe, otherwise it streams word-by-word
        // within a block that is still accumulating.
        if (codeBlockClosed || mathBlockClosed || emptyLine) {
          safeIndex = currentLength;
        }
      }

      // We only update if the new safeIndex gives us more text to display than before
      if (safeIndex > prevDisplayed.length) {
        return rawText.slice(0, safeIndex);
      }

      return prevDisplayed;
    });
  }, [rawText, status]); // Omitted 'displayedText' intentionally to avoid continuous re-trigger loops

  return displayedText;
}
