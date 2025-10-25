"use client";

import Markdown from "react-markdown";
import { InlineMath, BlockMath } from "react-katex";
// import {
//   remarkCustomMath,
//   remarkCustomLatexMath,
// } from "./remark-latex-style-math";
// import { remarkLLMLatexMath, debugAfterRemarkMath } from "./remark-math-latex";
// import remarkParse from "remark-parse";
// import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
// import rehypeMathjax from "rehype-mathjax";
// import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import rehypeFormat from "rehype-format";
import {
  addCitationsToContentInlineSuper,
  addCitationsToContentInlineSuperPerplexity,
  addCitationsToContentInlineOpenAI,
} from "@/components/searchGroundingUtils";
import SearchResult from "@/components/SearchResult";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  dark,
  light,
  twilight,
  a11yDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css"; // `rehype-katex` does not import the CSS
import CopyText from "@/components/CopyTextComponent";
import "@/styles/markdown.css";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
} from "react";
import {
  ChevronDown,
  ChevronRight,
  Brain,
  ExternalLink,
  Search,
  TerminalSquare,
  ClipboardList,
} from "lucide-react"; // or your preferred icon library
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const MarkdownComponent = forwardRef(function MarkdownComponent(props, ref) {
  let finalContent = props.children;
  if (Array.isArray(props?.annotations) && props.annotations.length > 0) {
    const contentWithCitations = addCitationsToContentInlineOpenAI(
      finalContent,
      props.annotations
    );
    finalContent = contentWithCitations;
  }
  if (props?.groundingChunks && props?.groundingSupports) {
    const contentWithCitations = addCitationsToContentInlineSuper(
      finalContent,
      props?.groundingChunks,
      props?.groundingSupports
    );
    finalContent = contentWithCitations;
  }

  if (props?.search_results) {
    // console.log("getting search results in markdown", props.search_results);
    const contentWithCitations = addCitationsToContentInlineSuperPerplexity(
      finalContent,
      props.search_results
    );
    finalContent = contentWithCitations;
  }

  const processedText = preprocessMarkdown(finalContent);
  const mathProcessedText = preprocessLatexMath(processedText);
  // console.log("mathProcessedText", mathProcessedText);
  finalContent = mathProcessedText;
  // finalContent = processedText;
  // console.log("finalContent", finalContent);
  // console.log("props?.think", props?.think);

  return (
    <div ref={ref}>
      {Array.isArray(props?.queries) && props.queries.length > 0 && (
        <QueryBlock>{props.queries}</QueryBlock>
      )}
      {props?.think && (
        <ThinkingBlock props={props}>{props.think}</ThinkingBlock>
      )}

      <CustomMarkdown props={props}>{finalContent}</CustomMarkdown>

      {props?.openai_search_results && (
        <OpenAISourcesComponent props={props}>
          {props?.openai_search_results}
        </OpenAISourcesComponent>
      )}
      {props?.groundingChunks && (
        <GeminiSourcesComponent props={props}>
          {props?.groundingChunks}
        </GeminiSourcesComponent>
      )}
      {props?.search_results && (
        <PerplexitySourcesComponent props={props}>
          {props.search_results}
        </PerplexitySourcesComponent>
      )}
      {Array.isArray(props?.results) &&
        props.results.length > 0 &&
        props.results.map((res, i) => (
          <TavilySourcesComponent key={i}>{res}</TavilySourcesComponent>
        ))}
    </div>
  );
});

export default MarkdownComponent;

function TavilySourcesComponent({ children, ...props }) {
  const [isExpanded, setIsExpanded] = useState(true);

  let parsedResults = null;
  try {
    if (typeof children === "string") {
      const json = JSON.parse(children);
      parsedResults = Array.isArray(json) ? json : json.results || [];
    } else if (typeof children === "object" && children !== null) {
      parsedResults = Array.isArray(children)
        ? children
        : children.results || [];
    }
  } catch (e) {
    console.warn("Failed to parse children JSON", e);
  }
  // console.log("parsedResults", parsedResults);
  return (
    <div
      {...props}
      className="glass glass-card-noise overflow-hidden flex flex-col my-4 rounded-lg text-black/80 dark:text-white/80"
    >
      {/* Header Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors glass-hover"
      >
        <span className="opacity-70">Search Results</span>
        <div className="flex-1" />
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Results */}
      {isExpanded && (
        <div
          // --- CHANGES START HERE ---
          className="overflow-x-auto divide-y divide-white/20 dark:divide-white/10"
          // --- CHANGES END HERE ---
        >
          {parsedResults ? (
            parsedResults.length > 0 ? (
              parsedResults.map((r, i) => {
                // IMPORTANT: You'll need to style the SearchResult component too.
                // See suggestions below.
                return <SearchResult key={i} result={r} i={i} />;
              })
            ) : (
              <p className="p-4 text-gray-500 dark:text-gray-400 text-sm italic">
                No results found.
              </p>
            )
          ) : (
            <pre
              // --- CHANGES START HERE ---
              className="m-4 whitespace-pre-wrap text-xs text-black/70 dark:text-white/70 bg-black/5 dark:bg-white/5 rounded-md p-3 overflow-auto"
              // --- CHANGES END HERE ---
            >
              {typeof children === "string"
                ? children
                : JSON.stringify(children, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function PerplexitySourcesComponent({ children, ...props }) {
  let sources = [];

  try {
    if (typeof children === "string") {
      sources = JSON.parse(children);
    } else if (Array.isArray(children)) {
      sources = children;
    }
  } catch (err) {
    console.error("Failed to parse sources JSON", err);
    return null;
  }

  if (!Array.isArray(sources) || sources.length === 0) {
    return null;
  }

  return (
    <div
      {...props}
      className=" mt-8 rounded-xl border bg-gradient-to-br from-muted/40 to-background p-[1px] shadow-md"
    >
      <div className="rounded-xl bg-card p-6">
        {/* Section heading */}
        <div className="mb-5 flex items-center gap-2">
          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Sources
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
        </div>

        <ul className=" overflow-x-auto  grid gap-4 sm:grid-cols-2">
          {sources.map((source, idx) => {
            const domain = getDomain(source.url);

            return (
              <li
                key={idx}
                className="rounded-lg border bg-muted/30 p-4 text-xs truncate hover:border-primary/40 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col h-full group"
                >
                  {/* Title with numeric badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col items-start gap-2 flex-1">
                      <span className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {idx + 1}
                      </span>
                      <h3 className="font-medium leading-snug line-clamp-2 flex-1">
                        {source.title}
                      </h3>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 mt-1" />
                  </div>

                  {/* Snippet */}
                  {source.snippet && (
                    <p className="mt-2 text-muted-foreground line-clamp-3 text-xs">
                      {source.snippet}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{domain}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {source.date && (
                        <time dateTime={source.date}>
                          Published:{" "}
                          {new Date(source.date).toLocaleDateString()}
                        </time>
                      )}
                      {source.last_updated && (
                        <time dateTime={source.last_updated}>
                          Updated:{" "}
                          {new Date(source.last_updated).toLocaleDateString()}
                        </time>
                      )}
                    </div>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function GeminiSourcesComponent({ children, ...props }) {
  const [isExpanded, setIsExpanded] = useState(true);
  // console.log("children", children);
  if (!Array.isArray(children)) {
    return null; // nothing will render
  }
  return (
    <div className="  mt-8 rounded-xl border bg-gradient-to-br from-muted/40 to-background p-[1px] shadow-md">
      <div className="rounded-xl bg-card p-4">
        {/* Header Toggle */}
        <div className=" flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
          >
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Sources
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>
        {/* Results */}
        {isExpanded && (
          <ul className=" overflow-x-auto grid gap-3 sm:grid-cols-2 !px-6 mt-5">
            {children.map((source, idx) => {
              const itemUrl = source.web.uri;
              const domain = getDomain(itemUrl);
              const itemTitle = source.web.title || domain;
              return (
                <li key={idx}>
                  <div className="group flex h-full items-center justify-between rounded-lg border bg-muted/30 p-3 text-xs hover:border-primary/40 hover:bg-accent hover:text-accent-foreground transition-colors">
                    <div className="flex flex-1 items-center gap-3">
                      <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {domain[0]?.toUpperCase()}
                      </span>

                      <div className="flex flex-col">
                        <p className="text-ellipsis overflow-hidden text-sm font-medium">
                          {itemTitle}
                        </p>
                        <a
                          href={itemUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {domain}
                        </a>
                      </div>
                    </div>
                    <a href={itemUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function OpenAISourcesComponent({ children, ...props }) {
  // console.log("OpenAISourcesComponent");
  const [isExpanded, setIsExpanded] = useState(true);

  if (!Array.isArray(children)) {
    return null; // nothing will render
  }
  return (
    <div className="  mt-8 rounded-xl border bg-gradient-to-br from-muted/40 to-background p-[1px] shadow-md">
      <div className="rounded-xl bg-card p-4">
        {/* Header Toggle */}
        <div className=" flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
          >
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Sources
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>
        {/* Results */}
        {isExpanded && (
          <ul className=" overflow-x-auto grid gap-3 sm:grid-cols-2 !px-6 mt-5">
            {children.map((source, idx) => {
              const itemUrl = source.url;
              const domain = getDomain(source.url);
              const itemTitle = domain;
              return (
                <li key={idx}>
                  <div className="group flex h-full items-center justify-between rounded-lg border bg-muted/30 p-3 text-xs hover:border-primary/40 hover:bg-accent hover:text-accent-foreground transition-colors">
                    <div className="flex flex-1 items-center gap-3">
                      <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {domain[0]?.toUpperCase()}
                      </span>

                      <div className="flex flex-col">
                        <p className="text-ellipsis overflow-hidden text-sm font-medium">
                          {itemTitle}
                        </p>
                        <a
                          href={itemUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {domain}
                        </a>
                      </div>
                    </div>
                    <a href={itemUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-60 group-hover:opacity-100" />
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

const getTextContent = (children) => {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(getTextContent).join("");
  if (React.isValidElement(children) && children.props.children) {
    return getTextContent(children.props.children);
  }
  return "";
};

function CustomMarkdown({ children, mode, props }) {
  const problematicTags = ["div", "pre", "tool", "output", "think"];
  const markdownChildren = children;
  const style = a11yDark;
  return (
    <Markdown
      remarkPlugins={[
        // remarkLLMLatexMath,
        // debugAfterRemarkMath,
        remarkMath,
        // debugAfterRemarkMath,
        remarkGfm,
      ]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      // prose prose-zinc dark:prose-invert !max-w-none
      className={` pb-4 break-words prose prose-zinc dark:prose-invert !max-w-none`}
      components={{
        sup(props) {
          const { children } = props;
          // const fullText = getTextContent(children);
          // console.log("fullText", fullText);
          return (
            <sup className="" style={{ marginLeft: "0.3em" }}>
              {children}
            </sup>
          );
        },
        a(props) {
          const { children, className, node, ...rest } = props;
          if (!rest.href.includes("http")) {
            return <a href={rest.href}>{children}</a>;
          } else {
            return <LinkTooltip rest={rest}>{children}</LinkTooltip>;
          }
        },
        table: TableWrapper,
        pre({ node, children, ...props }) {
          // If the only child is "code" with `language-search`, skip wrapping in <pre>
          if (
            node.children &&
            node.children[0]?.tagName === "code" &&
            (node.children[0]?.properties?.className?.includes(
              "language-search"
            ) ||
              node.children[0]?.properties?.className?.includes(
                "language-query"
              ) ||
              node.children[0]?.properties?.className?.includes(
                "language-tool"
              ) ||
              node.children[0]?.properties?.className?.includes(
                "language-output"
              ))
          ) {
            // Just render the children directly (SearchBlock will take over)
            return <>{children}</>;
          }
          // Default: keep pre
          return <pre {...props}>{children}</pre>;
        },
        code(props) {
          const { children, className, node, ...rest } = props;
          const text = children;
          // console.log("node", node);
          // console.log("className", className);
          // console.log("rest", rest);
          // console.log("children", children);

          // --- HANDLE INLINE CODE (` ... `) ---
          // This is inline code because it does NOT have a `language-*` class.
          // Check if the text matches our special inline math prefix.
          if (text && text.startsWith("math-inline:")) {
            const math = text.slice("math-inline:".length);
            // console.log("math", math);
            return <InlineMath>{math}</InlineMath>;
          }
          //
          const match = /language-(\w+)/.exec(className || "");
          if (match) {
            // set language
            const language = match[1];
            // known code block
            function CustomPreTag({ children, ...rest }) {
              // console.log("children", children)
              // console.log("rest", rest);
              // console.log(cn(className, "overflow-x-auto w-full  min-w-0"));
              return (
                <div
                  {...rest}
                  className="flex flex-col overflow-x-auto w-full  min-w-0"
                >
                  <div className="flex flex-row justify-between text-xs mb-4">
                    <div>{language}</div>
                    <CopyText text={text} />
                  </div>
                  {children}
                </div>
              );
            }
            // console.log("children", typeof children);
            // console.log("language", language);
            if (language === "search") {
              return (
                <SearchBlock
                  {...rest}
                  className={cn(className, "overflow-x-auto w-full  min-w-0")}
                >
                  {children}
                </SearchBlock>
              );
            }
            if (language === "tool") {
              return (
                <ToolBlock
                  {...rest}
                  className={cn(className, "overflow-x-auto w-full  min-w-0")}
                >
                  {children}
                </ToolBlock>
              );
            }
            if (language === "query") {
              return (
                <QueryBlock
                  {...rest}
                  className={cn(className, "overflow-x-auto w-full  min-w-0")}
                >
                  {children}
                </QueryBlock>
              );
            }
            if (language === "output") {
              return (
                <OutputBlock
                  {...rest}
                  className={cn(className, "overflow-x-auto w-full  min-w-0")}
                >
                  {children}
                </OutputBlock>
              );
            }
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
              <code
                {...rest}
                className={cn(className, "overflow-x-auto w-full  min-w-0")}
              >
                {children}
              </code>
            );
          }
        },
        tool({ node, children, ...props }) {
          return <ToolBlock {...props}>{children}</ToolBlock>;
        },
        output({ node, children, ...props }) {
          return <OutputBlock {...props}>{children}</OutputBlock>;
        },
        query({ node, children, ...props }) {
          return <QueryBlock {...props}>{children}</QueryBlock>;
        },
        search({ node, children, ...props }) {
          return <SearchBlock {...props}>{children}</SearchBlock>;
        },
        think({ node, children, ...props }) {
          return <ThinkingBlock {...props}>{children}</ThinkingBlock>;
        },
        p({ node, children, ...props }) {
          const hasBlockChild = React.Children.toArray(children).some(
            (child) => {
              if (!child || !child.type) return false;
              return problematicTags.includes(
                child.type.displayName || child.type.name || child.type
              );
            }
          );

          const paragraphClasses = "mb-4 leading-relaxed ";

          if (hasBlockChild) {
            return (
              <div {...props} className={paragraphClasses}>
                {children}
              </div>
            );
          }

          return (
            <p {...props} className={paragraphClasses}>
              {children}
            </p>
          );
        },
      }}
    >
      {markdownChildren}
    </Markdown>
  );
}

function TableWrapper({ node, ...props }) {
  // `props` will include any children, like <thead>, <tbody>, etc.
  return (
    <div className="overflow-x-auto my-4  w-full  min-w-0 ">
      <table {...props} className="w-full text-sm " />
    </div>
  );
}

function ToolBlock({ children, ...props }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      {...props}
      // --- CHANGES START HERE ---
      // Using glass-noise for a slightly different, but related, texture
      className="glass-subtle glass-noise flex flex-col my-2 rounded-lg text-black/80 dark:text-white/80"
      // --- CHANGES END HERE ---
    >
      {/* Header Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        // --- CHANGES START HERE ---
        className="w-full flex items-center gap-3 p-3 text-xs text-left transition-colors glass-hover focus:outline-none focus:ring-2 focus:ring-white/30 rounded-t-lg"
        // --- CHANGES END HERE ---
      >
        <TerminalSquare className="h-4 w-4 text-black/50 dark:text-white/50 shrink-0" />

        <div className="uppercase tracking-wide font-semibold text-black/70 dark:text-white/70">
          Tool Call
        </div>

        <div className="flex-1" />

        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-black/50 dark:text-white/50" />
        ) : (
          <ChevronRight className="h-4 w-4 text-black/50 dark:text-white/50" />
        )}
      </button>

      {/* Tool content */}
      {isExpanded && (
        // --- CHANGES START HERE ---
        // Using padding and an inset container for a clean look
        <div className="overflow-x-auto px-3 pb-3 pt-1 text-sm">
          <div className="bg-zinc-500/5 dark:bg-white/5 p-3 rounded-md font-mono text-xs">
            {children}
          </div>
        </div>
        // --- CHANGES END HERE ---
      )}
    </div>
  );
}

function ThinkingBlock({ children, ...props }) {
  const [isExpanded, setIsExpanded] = useState(true);
  // console.log("ThinkingBlock children:", children);
  // console.log("ThinkingBlock children type:", typeof children);
  // console.log("ThinkingBlock children length:", React.Children.count(children));

  return (
    <div className="  overflow-x-auto rounded-lg bg-muted/30 mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        {/* <Brain className="h-4 w-4 text-muted-foreground shrink-0" /> */}
        <span className="text-xs font-medium text-muted-foreground">
          Thought Tokens
        </span>
        <div className="flex-1" />
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className=" px-4 pb-4 text-sm text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}
// Search block component
function SearchBlock({ children, ...props }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // console.log("SearchBlock children", children);
  let parsedResults = null;
  try {
    if (typeof children === "string") {
      const json = JSON.parse(children);
      parsedResults = Array.isArray(json) ? json : json.results || [];
    } else if (typeof children === "object" && children !== null) {
      parsedResults = Array.isArray(children)
        ? children
        : children.results || [];
    }
  } catch (e) {
    console.warn("Failed to parse children JSON", e);
  }
  // console.log("parsedResults", parsedResults);
  return (
    <div
      {...props}
      className=" overflow-x-auto flex flex-col my-4 rounded-lg shadow-md bg-white text-gray-900 dark:bg-[#1f1f1f] dark:text-gray-100 border border-gray-200 dark:border-gray-700 transition-colors"
    >
      {/* Header Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
      >
        <span>Search Results</span>
        <div className="flex-1" />
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Results */}
      {isExpanded && (
        <div className="overflow-x-auto divide-y divide-gray-200 dark:divide-gray-700">
          {parsedResults ? (
            parsedResults.length > 0 ? (
              parsedResults.map((r, i) => {
                return <SearchResult key={i} result={r} i={i} />;
              })
            ) : (
              <p className="p-4 text-gray-500 dark:text-gray-400 text-sm italic">
                No results found.
              </p>
            )
          ) : (
            <pre className="m-4 whitespace-pre-wrap text-xs text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-[#2a2a2a] rounded-md p-3 overflow-auto">
              {typeof children === "string"
                ? children
                : JSON.stringify(children, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
// Query block component
function QueryBlock({ children, ...props }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      {...props}
      // --- CHANGES START HERE ---
      className="glass-subtle glass-frosted flex flex-col my-6 rounded-lg text-black/80 dark:text-white/80"
      // --- CHANGES END HERE ---
    >
      {/* Header Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        // --- CHANGES START HERE ---
        className="w-full flex items-center gap-3 p-3 text-xs text-left transition-colors glass-hover focus:outline-none focus:ring-2 focus:ring-white/30 rounded-t-lg"
        // --- CHANGES END HERE ---
      >
        {/* BONUS: Added a thematic icon for clarity */}
        <Search className="h-4 w-4 text-black/50 dark:text-white/50 shrink-0" />

        <div className="uppercase tracking-wide font-semibold text-black/70 dark:text-white/70">
          Search Query
        </div>

        <div className="flex-1" />

        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-black/50 dark:text-white/50" />
        ) : (
          <ChevronRight className="h-4 w-4 text-black/50 dark:text-white/50" />
        )}
      </button>

      {/* Query content */}
      {isExpanded && (
        // --- CHANGES START HERE ---
        // Added padding for a cleaner, flush look instead of margin
        <div className="overflow-x-auto px-3 pb-3 pt-1 text-sm">
          <div className="bg-zinc-500/5 dark:bg-white/5 p-3 rounded-md">
            {children}
          </div>
        </div>
        // --- CHANGES END HERE ---
      )}
    </div>
  );
}
// Output block component
function OutputBlock({ children, ...props }) {
  return (
    <div
      {...props}
      // --- CHANGES START HERE ---
      // Using the primary 'glass' class for more prominence, with 'grain' texture
      className="glass glass-grain flex flex-col my-2 rounded-lg text-black/80 dark:text-white/80"
      // --- CHANGES END HERE ---
    >
      {/* Header Row */}
      <div
        // --- CHANGES START HERE ---
        // Swapping opaque borders and colors for semi-transparent ones
        className="flex flex-row items-center gap-3 p-3 text-xs 
                   border-b border-white/20 dark:border-white/10"
        // --- CHANGES END HERE ---
      >
        <ClipboardList className="h-4 w-4 text-black/50 dark:text-white/50 shrink-0" />
        <div className="uppercase tracking-wide font-medium text-black/70 dark:text-white/70">
          Output
        </div>
        <div className="flex-1" />
        <CopyText text={children} />
      </div>
      {/* Main Output Content */}
      <div
        // --- CHANGES START HERE ---
        // Adding padding to the wrapper for a consistent look
        className="p-3"
      >
        <div className="font-mono whitespace-pre-wrap bg-black/5 dark:bg-white/5 p-3 rounded-md text-sm">
          {children}
        </div>
      </div>
    </div>
  );
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
    "\n\n<think>\n\n$1\n\n</think>\n\n"
  );
  processedTexts = processedTexts.replace(
    /<tool>([\s\S]*?)<\/tool>/g,
    "\n\n<tool>\n\n$1\n\n</tool>\n\n"
  );
  processedTexts = processedTexts.replace(
    /<output>([\s\S]*?)<\/output>/g,
    "\n\n<output>\n\n$1\n\n</output>\n\n"
  );
  processedTexts = processedTexts.replace(
    /<query>([\s\S]*?)<\/query>/g,
    "\n\n<query>\n\n$1\n\n</query>\n\n"
  );
  processedTexts = processedTexts.replace(
    /<search>([\s\S]*?)<\/search>/g,
    "\n\n<search>\n\n$1\n\n</search>\n\n"
  );
  // Replace \[ ... \] with $$ ... $$ for block math
  // processedTexts = processedTexts.replace(
  //   /\\\[(.*?)\\\]/gs,
  //   (_, match) => `\n$$${match}$$\n`
  // );
  // Replace \( ... \) with $ ... $ for inline math
  // processedTexts = processedTexts.replace(
  //   /\\\((.*?)\\\)/gs,
  //   (_, match) => `$${match}$`
  // );
  return processedTexts;
};

// Use safe tokens that won't conflict with regular text
export function preprocessLatexMath(markdown) {
  return (
    markdown
      // For block math, use a fenced code block with the language "math"
      .replace(/\\\[([\s\S]*?)\\\]/g, (match, content) => {
        return `\n\`\`\`math\n${content.trim()}\n\`\`\`\n`;
      })
      // For inline math, use an inline code span with a "math-inline:" prefix
      .replace(/\\\((.*?)\\\)/g, (match, content) => {
        return `\`math-inline:${content.trim()}\``;
        // return `{math}\`${content.trim()}\``;
      })
  );
}
function extractThinKContent(text) {
  // console.log("text", text);
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

export function CustomTooltip({ fullText, link, snippet, title, ...rest }) {
  // console.log(" snippet", snippet);
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
      snippet={rest["data-snippet"]}
      {...rest}
    />
  );
}
function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}
