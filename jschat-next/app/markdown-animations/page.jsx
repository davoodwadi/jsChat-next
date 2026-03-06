"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Play, RotateCcw } from "lucide-react";
import AnimatedMarkdown from "@/components/AnimatedMarkdown";

// The full content we want to simulate streaming
const FULL_CONTENT = `# Markdown Streaming Simulation

Welcome to this **word-by-word** streaming demo. This content is being simulated with a **100ms delay** per word to mimic an AI response.

## Key Features
- **Real-time rendering**: Watch as the markdown structure forms.
- **Math support**: Inline math like $E=mc^2$ or block math:
$$ \\int_{a}^{b} x^2 \\,dx $$
- **Code Highlighting**:
\`\`\`javascript
function simulateStream(text) {
  const words = text.split(" ");
  return words.map((word, i) => {
    return new Promise(resolve => setTimeout(resolve, i * 100));
  });
}
\`\`\`

## Data Tables
| Feature | Status |
| :--- | :--- |
| Word Delay | 100ms |
| Streaming | Active |
| Markdown | GFM |

> "The best way to predict the future is to create it." - Peter Drucker

Enjoy the simulation!`;

export default function MarkdownAnimationPage() {
  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokenIndex, setTokenIndex] = useState(0);

  // Split by whitespace but keep the whitespace as tokens to preserve formatting
  const tokens = React.useMemo(() => FULL_CONTENT.split(/(\s+)/), []);

  useEffect(() => {
    let interval;
    if (isStreaming && tokenIndex < tokens.length) {
      interval = setInterval(() => {
        setDisplayedText((prev) => prev + tokens[tokenIndex]);
        setTokenIndex((prev) => prev + 1);
      }, 100);
    } else if (tokenIndex >= tokens.length) {
      setIsStreaming(false);
    }

    return () => clearInterval(interval);
  }, [isStreaming, tokenIndex, tokens]);

  const startStream = () => {
    setDisplayedText("");
    setTokenIndex(0);
    setIsStreaming(true);
  };

  const resetStream = () => {
    setDisplayedText("");
    setTokenIndex(0);
    setIsStreaming(false);
  };

  const status = isStreaming ? "reading" : "done";

  return (
    <div className="min-h-screen bg-background p-4 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Controls */}
        <div className="flex items-center gap-4 p-4 glass rounded-2xl border border-border/50">
          <button
            onClick={startStream}
            disabled={isStreaming}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium",
              isStreaming
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95",
            )}
          >
            {tokenIndex === 0 ? (
              <Play className="h-4 w-4" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            {tokenIndex === 0 ? "Start Simulation" : "Restart"}
          </button>

          <button
            onClick={resetStream}
            className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-all active:scale-95"
          >
            Clear
          </button>

          <div className="flex-1 text-right text-xs text-muted-foreground font-mono">
            {isStreaming
              ? "STREAMING..."
              : tokenIndex >= tokens.length
                ? "COMPLETED"
                : "READY"}
          </div>
        </div>

        {/* Markdown Output */}
        <div className="p-8 glass-subtle rounded-3xl border border-border/40 shadow-xl min-h-[400px]">
          <AnimatedMarkdown content={displayedText} status={status} />
        </div>
      </div>
    </div>
  );
}
