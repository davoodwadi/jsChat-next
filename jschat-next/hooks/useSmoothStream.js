import { useState, useEffect, useRef, useMemo } from "react";

const EMPTY_SCAN_STATE = {
  processedUpTo: 0,
  safeIndex: 0,
  inCodeBlock: false,
  inMathBlock: false,
};

export function useSmoothStream(rawText, status, options = {}) {
  const {
    // You can define which boundaries trigger an update here.
    // Default: Newlines
    boundaries = /\n+/gu,
  } = options;

  const [displayedText, setDisplayedText] = useState(rawText || "");
  // Carries scan progress across renders so only newly arrived text is rescanned.
  const scanRef = useRef({ ...EMPTY_SCAN_STATE });

  useEffect(() => {
    // 1. No-op if not reading: instantly show all text
    if (status !== "reading") {
      scanRef.current = { ...EMPTY_SCAN_STATE };
      setDisplayedText(rawText || "");
      return;
    }

    if (!rawText || typeof rawText !== "string") return;

    setDisplayedText((prevDisplayed) => {
      // Reset if the stream restarted or was cleared
      if (rawText.length < prevDisplayed.length) {
        scanRef.current = { ...EMPTY_SCAN_STATE };
        return rawText;
      }

      const {
        processedUpTo,
        safeIndex: prevSafeIndex,
        inCodeBlock: prevInCodeBlock,
        inMathBlock: prevInMathBlock,
      } = scanRef.current;
      let safeIndex = prevSafeIndex;
      let inCodeBlock = prevInCodeBlock;
      let inMathBlock = prevInMathBlock;

      // Only scan the tail that arrived since the last run, not the whole text,
      // so total scan cost stays linear in rawText length over the whole stream.
      const tail = rawText.slice(processedUpTo);
      const tailLines = tail.split("\n");
      const lastIndex = tailLines.length - 1;

      let offset = processedUpTo;

      // Lines before the last entry are terminated by a "\n" inside `tail`,
      // so they're confirmed complete and safe to commit permanently.
      for (let i = 0; i < lastIndex; i++) {
        const line = tailLines[i];

        const wasInCodeBlock = inCodeBlock;
        const wasInMathBlock = inMathBlock;

        if (line.trim().startsWith("```")) {
          inCodeBlock = !inCodeBlock;
        }
        if (line.trim().startsWith("$$")) {
          inMathBlock = !inMathBlock;
        }

        offset += line.length + 1; // +1 for the newline that terminates this line

        const codeBlockClosed = wasInCodeBlock && !inCodeBlock;
        const mathBlockClosed = wasInMathBlock && !inMathBlock;
        const emptyLine = !inCodeBlock && !inMathBlock && line.trim() === "";
        if (codeBlockClosed || mathBlockClosed || emptyLine) {
          safeIndex = offset;
        }
      }

      // The final entry is still in progress (may grow further next update),
      // so re-check it each time without persisting its toggle state.
      const lastLine = tailLines[lastIndex];
      const lastWasInCodeBlock = inCodeBlock;
      const lastWasInMathBlock = inMathBlock;
      let tentativeCodeBlock = inCodeBlock;
      let tentativeMathBlock = inMathBlock;
      if (lastLine.trim().startsWith("```")) {
        tentativeCodeBlock = !tentativeCodeBlock;
      }
      if (lastLine.trim().startsWith("$$")) {
        tentativeMathBlock = !tentativeMathBlock;
      }
      const lastCodeBlockClosed = lastWasInCodeBlock && !tentativeCodeBlock;
      const lastMathBlockClosed = lastWasInMathBlock && !tentativeMathBlock;
      const lastEmptyLine =
        !tentativeCodeBlock && !tentativeMathBlock && lastLine.trim() === "";
      if (lastCodeBlockClosed || lastMathBlockClosed || lastEmptyLine) {
        safeIndex = rawText.length;
      }

      scanRef.current = {
        processedUpTo: offset,
        safeIndex,
        inCodeBlock,
        inMathBlock,
      };

      // We only update if the new safeIndex gives us more text to display than before
      if (safeIndex > prevDisplayed.length) {
        return rawText.slice(0, safeIndex);
      }

      return prevDisplayed;
    });
  }, [rawText, status]); // Omitted 'displayedText' intentionally to avoid continuous re-trigger loops

  return displayedText;
}
