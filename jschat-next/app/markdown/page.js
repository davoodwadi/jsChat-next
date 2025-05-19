import MarkdownComponent from "@/components/MarkdownComponent";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";

const someText = `Why was the math book sad?
Here is some text with a reference. ([1](https://www.example.com))
Here is some text with a reference.<sup>[
Example article
](https://www.example.com)</sup>
Because it had too many problems.`;

export default async function MarkdownPage() {
  // console.log("Markdown Page");
  // console.log("page runtime", process.env.NEXT_RUNTIME);

  // await test();
  return (
    <>
      <div className="break-words max-w-[85vw] mx-auto">
        <MarkdownComponent model="gpt-4o-mini">{someText}</MarkdownComponent>
      </div>
    </>
  );
}
