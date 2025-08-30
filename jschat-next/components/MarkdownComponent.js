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
  // addCitationsToContent,
  // addCitationsToContentInline,
  addCitationsToContentInlineSuper,
  addCitationsToContentInlineSuperPerplexity,
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
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";
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
  // console.log("props", props);
  let finalContent = props.children;

  if (props?.groundingChunks && props?.groundingSupports) {
    const contentWithCitations = addCitationsToContentInlineSuper(
      finalContent,
      props?.groundingChunks,
      props?.groundingSupports
    );
    finalContent = contentWithCitations;
  }

  if (props?.search_results) {
    console.log("getting search results in markdown", props.search_results);
    const contentWithCitations = addCitationsToContentInlineSuperPerplexity(
      finalContent,
      props.search_results
    );
    finalContent = contentWithCitations;
    // console.log("finalContent", finalContent);
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

// export function CustomTooltip({ fullText, link, ...rest }) {
//   const tooltipRef = useRef(null);
//   // console.log("rest", rest);

//   const showTooltip = () => {
//     if (tooltipRef.current) {
//       tooltipRef.current.style.opacity = "1";
//       tooltipRef.current.style.visibility = "visible";
//     }
//   };

//   const hideTooltip = () => {
//     if (tooltipRef.current) {
//       tooltipRef.current.style.opacity = "0";
//       tooltipRef.current.style.visibility = "hidden";
//     }
//   };
//   // console.log(fullText);
//   return (
//     <span
//       onMouseEnter={showTooltip}
//       onMouseLeave={hideTooltip}
//       className="relative inline-block cursor-pointer text-blue-500 underline"
//     >
//       <span className="flex flex-col max-w-[80px]">
//         <a
//           href={link}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-xs truncate"
//         >
//           {fullText}
//         </a>
//       </span>
//       <span
//         ref={tooltipRef}
//         // className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 z-50"
//         // className="absolute bottom-full left-0 mb-2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 z-50 max-w-[300px]"
//         className="absolute bottom-full left-0 mb-2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-150 z-50 max-w-[calc(100vw-20px)] overflow-auto"
//         role="tooltip"
//       >
//         <span className="flex flex-col max-w-xs">
//           <span className="truncate">{fullText}</span>
//           <span className="truncate">{link}</span>
//           {rest?.snippet && <span>{rest?.snippet}</span>}
//         </span>
//       </span>
//     </span>
//   );
// }

// function LinkTooltip({ children, rest }) {
//   const fullText = getTextFromChildren(children);

//   return (
//     <CustomTooltip fullText={fullText.trim()} link={rest.href} {...rest} />
//   );
// }

export function CustomTooltip({ fullText, link, snippet, title, ...rest }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    placement: "top",
  });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let newPosition = { top: 0, left: 0, placement: "top" };

    // Try to place above first
    const spaceAbove = triggerRect.top;
    const spaceBelow = viewport.height - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewport.width - triggerRect.right;

    // Determine vertical placement
    if (spaceAbove >= tooltipRect.height + 10 && spaceAbove > spaceBelow) {
      // Place above
      newPosition.top = triggerRect.top - tooltipRect.height - 8;
      newPosition.placement = "top";
    } else if (spaceBelow >= tooltipRect.height + 10) {
      // Place below
      newPosition.top = triggerRect.bottom + 8;
      newPosition.placement = "bottom";
    } else {
      // Place on side with more space
      if (spaceRight > spaceLeft) {
        newPosition.left = triggerRect.right + 8;
        newPosition.top =
          triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        newPosition.placement = "right";
      } else {
        newPosition.left = triggerRect.left - tooltipRect.width - 8;
        newPosition.top =
          triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        newPosition.placement = "left";
      }
    }

    // Determine horizontal placement for top/bottom placements
    if (newPosition.placement === "top" || newPosition.placement === "bottom") {
      // Try to center first
      let leftPos =
        triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;

      // Check boundaries and adjust
      if (leftPos < 10) {
        leftPos = 10;
      } else if (leftPos + tooltipRect.width > viewport.width - 10) {
        leftPos = viewport.width - tooltipRect.width - 10;
      }

      newPosition.left = leftPos;
    }

    // Ensure tooltip doesn't go off screen vertically for side placements
    if (newPosition.placement === "left" || newPosition.placement === "right") {
      if (newPosition.top < 10) {
        newPosition.top = 10;
      } else if (newPosition.top + tooltipRect.height > viewport.height - 10) {
        newPosition.top = viewport.height - tooltipRect.height - 10;
      }
    }

    setPosition(newPosition);
    setIsPositioned(true);
  }, []);

  const showTooltip = useCallback(() => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    setIsVisible(true);
    setIsPositioned(false); // Reset positioning state
  }, []);

  const hideTooltip = useCallback(() => {
    // Add a small delay to allow moving to tooltip
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsPositioned(false);
    }, 100);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isVisible && mounted && !isPositioned) {
      // Calculate position immediately when tooltip becomes visible
      const timer = setTimeout(calculatePosition, 0);

      return () => clearTimeout(timer);
    }
  }, [isVisible, mounted, isPositioned, calculatePosition]);

  useEffect(() => {
    if (isVisible && mounted) {
      const handleResize = () => {
        if (isVisible) {
          setIsPositioned(false);
          calculatePosition();
        }
      };

      const handleScroll = () => {
        if (isVisible) {
          setIsPositioned(false);
          calculatePosition();
        }
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isVisible, mounted, calculatePosition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const formatUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.pathname !== "/" ? urlObj.pathname : "");
    } catch {
      return url;
    }
  };

  // Tooltip content component
  const TooltipContent = () => (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] max-w-sm min-w-[200px] pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        // Only show tooltip after position is calculated to prevent transition from top-left
        opacity: isVisible && isPositioned ? 1 : 0,
        visibility: isVisible && isPositioned ? "visible" : "hidden",
        transition: isPositioned ? "opacity 150ms ease-in-out" : "none",
      }}
      role="tooltip"
      onMouseEnter={cancelHide}
      onMouseLeave={hideTooltip}
    >
      <div className="bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 overflow-hidden pointer-events-auto">
        {/* Arrow */}
        <div
          className={`absolute w-2 h-2 bg-gray-900 border-gray-700 transform rotate-45 ${
            position.placement === "top"
              ? "bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b"
              : position.placement === "bottom"
                ? "top-[-4px] left-1/2 -translate-x-1/2 border-l border-t"
                : position.placement === "left"
                  ? "right-[-4px] top-1/2 -translate-y-1/2 border-r border-t"
                  : "left-[-4px] top-1/2 -translate-y-1/2 border-l border-b"
          }`}
        />

        <div className="p-3 space-y-2">
          {/* Title */}
          {title && (
            <div className="font-medium text-sm text-gray-100 leading-tight">
              {title}
            </div>
          )}

          {/* URL */}
          <div className="flex items-center space-x-2 text-xs">
            <svg
              className="w-3 h-3 text-blue-400 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-blue-300 truncate">{formatUrl(link)}</span>
          </div>

          {/* Snippet */}
          {snippet && (
            <div className="text-xs text-gray-300 leading-relaxed">
              {snippet.length > 150 ? `${snippet.slice(0, 150)}...` : snippet}
            </div>
          )}

          {/* Click hint */}
          <div className="text-xs text-gray-500 border-t border-gray-700 pt-2 mt-2">
            Click to open link
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="relative inline-block cursor-pointer text-blue-600 hover:text-blue-800 underline decoration-dotted underline-offset-2 transition-colors"
        tabIndex={0}
      >
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit no-underline"
          onClick={(e) => e.stopPropagation()}
        >
          {fullText}
        </a>
      </span>

      {/* Render tooltip using Portal to avoid HTML nesting issues */}
      {mounted && isVisible && createPortal(<TooltipContent />, document.body)}
    </>
  );
}

function LinkTooltip({ children, rest }) {
  const fullText = getTextFromChildren(children);

  return (
    <CustomTooltip
      fullText={fullText.trim()}
      link={rest.href}
      title={rest.title}
      snippet={rest.snippet}
      {...rest}
    />
  );
}
