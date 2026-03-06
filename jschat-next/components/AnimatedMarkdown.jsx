"use client";

import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import CopyText from "@/components/CopyTextComponent";
import { cn } from "@/lib/utils";
import { useSmoothStream } from "@/hooks/useSmoothStream";

export const StatusContext = React.createContext("done");

// Custom components for Markdown rendering to match project style
const geminiComponentsMap = {
  h1({ node, children, ...props }) {
    const status = React.useContext(StatusContext);
    return (
      <h1
        {...props}
        className={cn(
          status === "reading" &&
            "animate-in fade-in duration-700 ease-out fill-mode-both",
        )}
      >
        {children}
      </h1>
    );
  },
  h2({ node, children, ...props }) {
    const status = React.useContext(StatusContext);
    return (
      <h2
        {...props}
        className={cn(
          status === "reading" &&
            "animate-in fade-in duration-700 ease-out fill-mode-both",
        )}
      >
        {children}
      </h2>
    );
  },
  h3({ node, children, ...props }) {
    const status = React.useContext(StatusContext);
    return (
      <h3
        {...props}
        className={cn(
          status === "reading" &&
            "animate-in fade-in duration-700 ease-out fill-mode-both",
        )}
      >
        {children}
      </h3>
    );
  },
  h4({ node, children, ...props }) {
    const status = React.useContext(StatusContext);
    return (
      <h4
        {...props}
        className={cn(
          status === "reading" &&
            "animate-in fade-in duration-700 ease-out fill-mode-both",
        )}
      >
        {children}
      </h4>
    );
  },
  h5({ node, children, ...props }) {
    const status = React.useContext(StatusContext);
    return (
      <h5
        {...props}
        className={cn(
          status === "reading" &&
            "animate-in fade-in duration-700 ease-out fill-mode-both",
        )}
      >
        {children}
      </h5>
    );
  },
  h6({ node, children, ...props }) {
    const status = React.useContext(StatusContext);
    return (
      <h6
        {...props}
        className={cn(
          status === "reading" &&
            "animate-in fade-in duration-700 ease-out fill-mode-both",
        )}
      >
        {children}
      </h6>
    );
  },
  ul({ node, children, ...props }) {
    const status = React.useContext(StatusContext);
    return (
      <ul
        {...props}
        className={cn(
          status === "reading" &&
            "animate-in fade-in duration-700 ease-out fill-mode-both",
        )}
      >
        {children}
      </ul>
    );
  },
  ol({ node, children, ...props }) {
    const status = React.useContext(StatusContext);
    return (
      <ol
        {...props}
        className={cn(
          status === "reading" &&
            "animate-in fade-in duration-700 ease-out fill-mode-both",
        )}
      >
        {children}
      </ol>
    );
  },
  li({ node, children, ...props }) {
    const status = React.useContext(StatusContext);
    return (
      <li
        {...props}
        className={cn(
          status === "reading" &&
            "animate-in fade-in duration-700 ease-out fill-mode-both",
        )}
      >
        {children}
      </li>
    );
  },
  blockquote({ node, children, ...props }) {
    const status = React.useContext(StatusContext);
    return (
      <blockquote
        {...props}
        className={cn(
          status === "reading" &&
            "animate-in fade-in duration-700 ease-out fill-mode-both",
        )}
      >
        {children}
      </blockquote>
    );
  },
  sup(props) {
    const { children } = props;
    const status = React.useContext(StatusContext);
    return (
      <sup
        className={cn(
          status === "reading" &&
            "animate-in fade-in duration-700 ease-out fill-mode-both",
        )}
        style={{ marginLeft: "0.3em" }}
      >
        {children}
      </sup>
    );
  },
  table: ({ node, ...props }) => {
    const status = React.useContext(StatusContext);
    return (
      <div
        className={cn(
          "overflow-x-auto my-4 w-full min-w-0",
          status === "reading" &&
            "animate-in fade-in duration-700 ease-out fill-mode-both",
        )}
      >
        <table {...props} className="w-full text-sm border-collapse" />
      </div>
    );
  },
  code(props) {
    const { children, className, node, ...rest } = props;
    const text = children;
    const status = React.useContext(StatusContext);

    // Handle inline math if formatted that way
    if (text && typeof text === "string" && text.startsWith("math-inline:")) {
      const math = text.slice("math-inline:".length);
      return <InlineMath>{math}</InlineMath>;
    }

    const match = /language-(\w+)/.exec(className || "");
    if (match) {
      const language = match[1];
      return (
        <div
          className={cn(
            "flex flex-col overflow-x-auto w-full min-w-0 my-4 rounded-xl border border-border/50 bg-black/5 dark:bg-white/5 overflow-hidden",
            status === "reading" &&
              "animate-in fade-in duration-700 ease-out fill-mode-both",
          )}
        >
          <div className="flex flex-row justify-between items-center px-4 py-2 bg-muted/50 text-xs font-mono border-b border-border/50">
            <div className="text-muted-foreground">{language}</div>
            <CopyText text={text} />
          </div>
          <SyntaxHighlighter
            {...rest}
            PreTag="div"
            children={String(children).replace(/\n$/, "")}
            language={language}
            style={a11yDark}
            customStyle={{
              margin: 0,
              padding: "1rem",
              background: "transparent",
              fontSize: "0.875rem",
            }}
          />
        </div>
      );
    } else {
      return (
        <code
          {...rest}
          className={cn(
            className,
            "bg-muted px-1.5 py-0.5 rounded text-sm font-mono",
            status === "reading" &&
              "animate-in fade-in duration-700 ease-out fill-mode-both",
          )}
        >
          {children}
        </code>
      );
    }
  },
  p({ node, children, ...props }) {
    const status = React.useContext(StatusContext);
    return (
      <p
        {...props}
        className={cn(
          "mb-4 leading-relaxed",
          status === "reading" &&
            "animate-in fade-in duration-700 ease-out fill-mode-both",
        )}
      >
        {children}
      </p>
    );
  },
};

export default function AnimatedMarkdown({ content, status }) {
  const contentToRender = useSmoothStream(content, status, {
    boundaries: /\n+/gu,
  });
  //   console.log(content, status);
  return (
    <StatusContext.Provider value={status}>
      <Markdown
        remarkPlugins={[
          [remarkMath, { singleDollarTextMath: false }],
          remarkGfm,
        ]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        className="pb-4 break-words prose prose-zinc dark:prose-invert !max-w-none"
        components={geminiComponentsMap}
      >
        {contentToRender}
      </Markdown>
    </StatusContext.Provider>
  );
}
