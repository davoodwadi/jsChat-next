import MarkdownComponent from "@/components/MarkdownComponent";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";

import fs from "fs";
import path from "path";

const someText = `Why was the math book sad?
Here is some text with a reference. ([1](https://www.example.com))
Here is some text with a reference.<sup>[
Example article
](https://www.example.com)</sup>
Because it had too many problems.`;

// const markdown = `
// This is inline math: \\(E = mc^2\\) and more text.

// This is block math:
// \\[
//   \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
// \\]

// Regular block

// $$
// E = mc^2
// $$
//   `;

export default async function MarkdownPage() {
  const filePath = path.join(process.cwd(), "public", "test-math.md");
  const markdown = fs.readFileSync(filePath, "utf8");
  // console.log("markdown", markdown);
  // console.log("page runtime", process.env.NEXT_RUNTIME);

  // await test();
  return (
    <>
      <div className="break-words max-w-[85vw] mx-auto">
        <MarkdownComponent>{markdown}</MarkdownComponent>
      </div>
    </>
  );
}
