// test-stream.js
const FULL_CONTENT = `# Markdown Streaming Simulation

Welcome to this **word-by-word** streaming demo. This content is being simulated with a **100ms delay** per word to mimic an AI response.

## Key Features
- **Real-time rendering**: Watch as the markdown structure forms.
- **Math support**: Inline math like $E=mc^2$ or block math:
$$ \int_{a}^{b} x^2 \,dx $$
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

function calculateSafeIndex(rawText) {
  let safeIndex = 0;
  let inCodeBlock = false;
  let inMathBlock = false;

  const lines = rawText.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let wasInCodeBlock = inCodeBlock;
    let wasInMathBlock = inMathBlock;

    if (line.trim().startsWith("\`\`\`")) {
      inCodeBlock = !inCodeBlock;
    }

    if (line.trim().startsWith("$$")) {
      inMathBlock = !inMathBlock;
    }

    const currentLength =
      lines.slice(0, i + 1).join("\n").length + (i < lines.length - 1 ? 1 : 0);

    const codeBlockClosed = wasInCodeBlock && !inCodeBlock;
    const mathBlockClosed = wasInMathBlock && !inMathBlock;
    // An empty line signals a break between paragraphs, lists, blockquotes, etc.
    const emptyLine = !inCodeBlock && !inMathBlock && line.trim() === "";

    // We no longer blindly mark the last streamed line as safe, otherwise it streams word-by-word
    // within a block that is still accumulating.
    if (codeBlockClosed || mathBlockClosed || emptyLine) {
      safeIndex = currentLength;
    }
  }
  return safeIndex;
}

const tokens = FULL_CONTENT.split(/(\s+)/);
let streamedText = "";
let prevSafeIndex = 0;

for (let i = 0; i < tokens.length; i++) {
  streamedText += tokens[i];
  // console.log("streamedText", streamedText);
  const safeIndex = calculateSafeIndex(streamedText);
  if (safeIndex > prevSafeIndex) {
    console.log("--- CHUNK BOUNDARY ---");
    console.log(streamedText.slice(prevSafeIndex, safeIndex));
    prevSafeIndex = safeIndex;
  }
}
console.log("--- END STREAM ---");
