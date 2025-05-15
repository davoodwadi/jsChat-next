import Markdown from "react-markdown";
// import remarkParse from "remark-parse";
// import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
// import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
// import rehypeMathjax from "rehype-mathjax";
// import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import rehypeFormat from "rehype-format";
// import { visit } from "unist-util-visit";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  dark,
  light,
  twilight,
  a11yDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css"; // `rehype-katex` does not import the CSS for you
// import { Inter } from "next/font/google";
import CopyText from "@/components/CopyTextComponent";
// import "@/node_modules/github-markdown-css/github-markdown.css";
import "@/styles/markdown.css";
// const inter = Inter({ subsets: ["latin"] });

export default function MarkdownComponent(props) {
  // console.log("props.children.length MD", props.children.length);

  let finalContent = props.children;
  // console.log("props.children", props.children);
  // console.log("props", props);
  if (props?.groundingChunks && props?.groundingSupports) {
    // console.log(props?.groundingChunks);
    const contentWithCitations = addCitationsToContent(
      finalContent,
      props?.groundingChunks,
      props?.groundingSupports
    );
    finalContent = contentWithCitations;
  }
  const processedText = preprocessMarkdown(finalContent);
  // console.log("processedText", processedText);

  const { think, content } = extractThinKContent(processedText);
  finalContent = content;
  // finalContent = processedText;
  // console.log("think ", think);
  // console.log("content ", content);
  // console.log("finalContent ", finalContent);

  // console.log("markdown props.children", props.children);
  // console.log("markdown processedText", processedText);

  return (
    <>
      {think && <CustomMarkdown mode="think">{think}</CustomMarkdown>}
      <CustomMarkdown mode="regular">{finalContent}</CustomMarkdown>
    </>
  );
}
function CustomMarkdown({ children, mode }) {
  const markdownChildren = children;
  const style = a11yDark;
  const customStyle = mode === "think" ? " text-gray-600 italic " : "";
  return (
    <Markdown
      remarkPlugins={[[remarkMath, { singleDollarTextMath: true }], remarkGfm]}
      rehypePlugins={[
        rehypeKatex,
        // rehypeFormat,
        // rehypeStringify,
        // rehypeRaw
      ]}
      // children={props.children}
      className={`markdown-body ${customStyle} pb-4`}
      // skipHtml={true}
      components={{
        sup(props) {
          const { children, className, node, ...rest } = props;
          // console.log("children", children);
          return <sup style={{ marginLeft: "0.3em" }}>{children}</sup>;
        },
        a(props) {
          const { children, className, node, ...rest } = props;
          if (!(className === "data-footnote-backref")) {
            if (!rest.href.includes("http")) {
              return <a href={rest.href}>{children}</a>;
            } else {
              return (
                <a
                  href={rest.href}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                >
                  {children}
                </a>
              );
            }
          }
        },
        code(props) {
          const { children, className, node, ...rest } = props;
          const text = children;

          const match = /language-(\w+)/.exec(className || "");
          if (match) {
            // set language
            const language = match[1];
            // known code block
            function CustomPreTag({ children, ...rest }) {
              // console.log("children", children)
              // console.log("rest", rest)
              return (
                <div {...rest} className="flex flex-col ">
                  <div className="flex flex-row justify-between text-xs mb-4">
                    <div>{language}</div>
                    <CopyText text={text} />
                  </div>
                  {children}
                </div>
              );
            }
            // console.log("children", typeof children);
            return (
              <>
                <SyntaxHighlighter
                  {...rest}
                  PreTag={CustomPreTag} //"div"
                  children={String(children).replace(/\n$/, "")}
                  language={match[1]}
                  style={style}
                  // showLineNumbers
                />
              </>
            );
          } else {
            return (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          }
        },
      }}
    >
      {markdownChildren}
    </Markdown>
  );
}
function findTextPositions(bigText, searchText) {
  const startIndex = bigText.indexOf(searchText);
  if (startIndex === -1) {
    return null; // text not found
  }
  const endIndex = startIndex + searchText.length - 1;
  return { startIndex, endIndex };
}
const addCitationsToContent = (content, groundingChunks, groundingSupports) => {
  let result = content;
  const references = new Map(); // Maps chunk indices to their URLs and titles

  // Sort supports by endIndex in descending order to avoid changing indices
  // when we insert content
  const sortedSupports = [...groundingSupports].sort(
    (a, b) => b.segment.endIndex - a.segment.endIndex
  );
  // console.log("sortedSupports", sortedSupports);
  // Process each support
  sortedSupports.forEach((support) => {
    const { segment, groundingChunkIndices } = support;

    // Generate citation markers for this segment
    const citationText = groundingChunkIndices
      .map((chunkIndex) => {
        const chunk = groundingChunks[chunkIndex];

        // Add to references if not already added
        if (!references.has(chunkIndex)) {
          references.set(chunkIndex, {
            url: chunk.web.uri,
            title: chunk.web.title,
          });
        }
        return `[^${chunkIndex + 1}]`;
      })
      .join("");

    // const citationTextBrackets = ` [${citationText}]`;
    const citationTextBrackets = `${citationText}`;
    // console.log("citationTextBrackets", citationTextBrackets);

    // Insert citations at the end of the segment
    const { text } = segment;
    const { startIndex, endIndex } = findTextPositions(result, text);
    // console.log("result", result);
    // console.log(startIndex, endIndex);
    // console.log(segment?.startIndex, segment?.endIndex);
    // console.log(result.slice(startIndex, endIndex));
    result =
      result.slice(0, endIndex) + citationTextBrackets + result.slice(endIndex);
    // console.log("result", result);
  });

  // Add references section at the end
  if (references.size > 0) {
    // console.log("references", references);
    result += "\n\n## References\n\n";
    const sortedReferences = Array.from(references.entries()).sort(
      ([chunkIndexA], [chunkIndexB]) => chunkIndexA - chunkIndexB
    );
    // Add each reference using Markdown reference-style links
    for (let [chunkIndex, ref] of sortedReferences) {
      // console.log("chunkIndex, ref", chunkIndex, ref);
      // console.log(`[^${chunkIndex + 1}]: ${ref.url} "${ref.title}"\n`);
      // result += `[^${chunkIndex + 1}]: "${ref.title}" ${ref.url}\n`;
      result += `[^${chunkIndex + 1}]: [${ref.title}](${ref.url})\n\n`;
    }
  }
  return result;
};

const preprocessMarkdown = (text) => {
  // return text;
  let processedTexts = text;
  processedTexts = processedTexts.replace(
    /<think>([\s\S]*?)<\/think>/g,
    "\n\n<think>\n$1\n</think>\n\n"
  );
  // Replace \[ ... \] with $$ ... $$ for block math
  processedTexts = processedTexts.replace(
    /\\\[(.*?)\\\]/gs,
    (_, match) => `\n$$${match}$$\n`
  );
  // processedTexts = processedTexts.replace(/\\\[/g, "```math ");
  // processedTexts = processedTexts.replace(/\\\]/g, "```");
  // Replace \( ... \) with $ ... $ for inline math
  processedTexts = processedTexts.replace(
    /\\\((.*?)\\\)/gs,
    (_, match) => `$${match}$`
  );
  return processedTexts;
};
function extractThinKContent(text) {
  const startTag = "<think>";
  const endTag = "</think>";

  const startIndex = text.indexOf(startTag);
  // console.log(startIndex, "startIndex");

  // If no <think> tag
  if (startIndex === -1) return { think: null, content: text };

  // Look for closing </think> tag
  const endIndex = text.indexOf(endTag);
  // console.log(endIndex, "endIndex");

  let think;
  let content;
  if (endIndex !== -1) {
    // Closing tag exists — extract just the content between
    think = text.slice(startIndex + startTag.length, endIndex);
    content = text.slice(endIndex + endTag.length);
  } else {
    // No closing tag
    think = text.slice(startIndex + startTag.length);
    content = "";
  }

  return { content, think };
}
