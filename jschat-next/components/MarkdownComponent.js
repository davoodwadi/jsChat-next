"use client";

import Markdown from "react-markdown";
// import remarkParse from "remark-parse";
// import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
// import rehypeMathjax from "rehype-mathjax";
// import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import rehypeFormat from "rehype-format";
// import { visit } from "unist-util-visit";
import {
  addCitationsToContent,
  addCitationsToContentInline,
} from "@/components/searchGroundingUtils";
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
import { useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tooltip as ReactToolTip } from "react-tooltip";
import Link from "next/link";

// const inter = Inter({ subsets: ["latin"] });

export default function MarkdownComponent(props) {
  // console.log("props.children.length MD", props.children.length);

  let finalContent = props.children;
  // console.log("props.children", props.children);
  // console.log("props", props);
  if (props?.groundingChunks && props?.groundingSupports) {
    // console.log(props?.groundingChunks);

    const contentWithCitations = addCitationsToContentInline(
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
        rehypeRaw,
      ]}
      // children={props.children}
      className={`markdown-body ${customStyle} pb-4`}
      // skipHtml={true}
      components={{
        p(props) {
          const { children, className, node, ...rest } = props;
          // console.log("children", children);
          return <span className={className}>{children}</span>;
        },
        sup(props) {
          const { children, className, node, ...rest } = props;
          // console.log("children", children);
          return <sup style={{ marginLeft: "0.3em" }}>{children}</sup>;
        },
        a(props) {
          const { children, className, node, ...rest } = props;
          const [trim, setTrim] = useState(true);
          if (!(className === "data-footnote-backref")) {
            if (!rest.href.includes("http")) {
              return <a href={rest.href}>{children}</a>;
            } else {
              return (
                // <LinkReactTooltip rest={rest}>{children}</LinkReactTooltip>
                <LinkShadcnTooltip rest={rest}>{children}</LinkShadcnTooltip>
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

function LinkShadcnTooltip({ children, rest }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger className="text-blue-500">
          {getFirstWord(children)}
        </TooltipTrigger>
        <TooltipContent>
          <Link
            className="text-blue-500"
            href={rest.href}
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            {children}
          </Link>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
function LinkReactTooltip({ children, rest }) {
  return (
    <>
      <style>
        {`.custom-tooltip {
  padding: 16px 32px;
  border-radius: 3px;
  font-size: 90%;
  width: max-content;
}
        
        `}
      </style>
      <ReactToolTip
        id="my-tooltip"
        clickable
        className="cursor-pointer custom-tooltip"
        place="top-start"
      >
        <Link
          className="text-blue-500"
          href={rest.href}
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          {children}
        </Link>
      </ReactToolTip>
      <a
        className="text-blue-500"
        data-tooltip-id="my-tooltip"
        href={rest.href}
        target={"_blank"}
        rel={"noopener noreferrer"}
      >
        {getFirstWord(children)}
      </a>
    </>
  );
}
function getFirstWord(str) {
  try {
    if (typeof str !== "string") return "";

    // Remove non-alphanumeric characters except whitespace
    const cleaned = str.replace(/[^\w\s]/g, "");

    // Trim and split by one or more whitespace characters
    const words = cleaned.trim().split(/\s+/);

    // Return first word or empty string if none exists
    return words[0] || "";
  } catch (error) {
    // console.error("Error in getFirstWord:", error.message);
    return "";
  }
}

// Example usage:
console.log(getFirstWord("  Hello, world! How are you?")); // "Hello"
console.log(getFirstWord("*** $$$ 123abc")); // "123abc"
console.log(getFirstWord("   !!!  ")); // ""
console.log(getFirstWord(123)); // "" and logs error

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
