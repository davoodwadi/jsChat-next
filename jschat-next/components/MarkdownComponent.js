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
  addCitationsToContentInlineSuper,
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
import React, { useRef, forwardRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tooltip as ReactToolTip } from "react-tooltip";
import Link from "next/link";

// const inter = Inter({ subsets: ["latin"] });

const MarkdownComponent = forwardRef(function MarkdownComponent(props, ref) {
  let finalContent = props.children;

  if (props?.groundingChunks && props?.groundingSupports) {
    const contentWithCitations = addCitationsToContentInlineSuper(
      finalContent,
      props?.groundingChunks,
      props?.groundingSupports
    );
    finalContent = contentWithCitations;
  }

  const processedText = preprocessMarkdown(finalContent);
  const { think, content } = extractThinKContent(processedText);
  finalContent = content;

  return (
    <div ref={ref}>
      {think && (
        <CustomMarkdown mode="think" props={props}>
          {think}
        </CustomMarkdown>
      )}
      <CustomMarkdown mode="regular" props={props}>
        {finalContent}
      </CustomMarkdown>
    </div>
  );
});

export default MarkdownComponent;

function CustomMarkdown({ children, mode, props }) {
  const markdownChildren = children;
  const style = a11yDark;
  const customStyle = mode === "think" ? " text-gray-600 italic " : "";
  // console.log(
  //         "CustomMarkdown props?.botMessage?.status",
  //         props?.botMessage?.status
  //       );
  const status = props?.botMessage?.status;
  // console.log("status", status);
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
        // p(props) {
        //   const { children, className, node, ...rest } = props;
        //   return <span className={className}>{children}</span>;
        // },
        sup(props) {
          const { children, className, node, ...rest } = props;
          // console.log("children", children);
          return <sup style={{ marginLeft: "0.3em" }}>{children}</sup>;
        },
        a(props) {
          const { children, className, node, ...rest } = props;
          if (!rest.href.includes("http")) {
            return <a href={rest.href}>{children}</a>;
          } else {
            return <LinkTooltip rest={rest}>{children}</LinkTooltip>;
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

function getTextFromChildren(children) {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map(getTextFromChildren).join(" ");
  }
  if (typeof children === "object" && children?.props?.children) {
    return getTextFromChildren(children.props.children);
  }
  return "";
}

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

export function CustomTooltip({ fullText, firstWord, link }) {
  const tooltipRef = useRef(null);

  const showTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = "1";
      tooltipRef.current.style.visibility = "visible";
    }
  };

  const hideTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = "0";
      tooltipRef.current.style.visibility = "hidden";
    }
  };
  // console.log(fullText);
  return (
    <span
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      className="relative inline-block cursor-pointer text-blue-500 underline"
    >
      <span className="flex flex-col max-w-[80px]">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs truncate"
        >
          {fullText}
        </a>
      </span>
      <span
        ref={tooltipRef}
        // className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 z-50"
        // className="absolute bottom-full left-0 mb-2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 z-50 max-w-[300px]"
        className="absolute bottom-full left-0 mb-2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 z-50 max-w-[calc(100vw-20px)] overflow-auto"
        role="tooltip"
      >
        <span className="flex flex-col max-w-xs">
          <span className="truncate">{fullText}</span>
          <span className="truncate">{link}</span>
        </span>
      </span>
    </span>
  );
}

function LinkTooltip({ children, rest }) {
  const fullText = getTextFromChildren(children);
  const firstWord = getFirstWord(fullText);

  return (
    <CustomTooltip
      fullText={fullText.trim()}
      firstWord={firstWord}
      link={rest.href}
    />
  );
}
