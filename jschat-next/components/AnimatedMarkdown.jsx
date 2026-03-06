"use client";

import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  a11yDark,
  nightOwl,
  nord,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import CopyText from "@/components/CopyTextComponent";
import {
  ChevronDown,
  ChevronRight,
  Brain,
  ExternalLink,
  Search,
  TerminalSquare,
  ClipboardList,
  Cog,
} from "lucide-react"; // or your preferred icon library
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ToolBlock,
  QueryBlock,
  OutputBlock,
  SearchBlock,
  LinkTooltip,
} from "./MarkdownComponent";
import { useSmoothStream } from "@/hooks/useSmoothStream";

const style = a11yDark;

export const StatusContext = React.createContext("done");

function withAnimation(Component, defaultClassName = "") {
  return function AnimatedComponent(props) {
    const status = React.useContext(StatusContext);
    const { className, node, children, ...rest } = props;
    // console.log(status, className);
    return (
      <Component
        {...rest}
        className={cn(
          defaultClassName,
          className,
          status === "reading"
            ? "animate-in fade-in duration-700 ease-out fill-mode-both"
            : "",
        )}
      >
        {children}
      </Component>
    );
  };
}

const baseAnimatedComponents = {
  h1: withAnimation("h1"),
  h2: withAnimation("h2"),
  h3: withAnimation("h3"),
  h4: withAnimation("h4"),
  h5: withAnimation("h5"),
  h6: withAnimation("h6"),
  ul: withAnimation("ul"),
  ol: withAnimation("ol"),
  li: withAnimation("li"),
  blockquote: withAnimation("blockquote"),
  sup: withAnimation("sup"), // Will add marginLeft later
  p: withAnimation("p", "mb-4 leading-relaxed"),
};

const AnimatedTableWrapper = ({ node, ...props }) => {
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
};

const GeminiCode = ({ node, children, className, ...rest }) => {
  const text = children;
  // console.log("className", className);
  // Handle inline math if formatted that way
  if (text && typeof text === "string" && text.startsWith("math-inline:")) {
    const math = text.slice("math-inline:".length);
    return <InlineMath>{math}</InlineMath>;
  }

  const match = /language-(\w+)/.exec(className || "");
  if (match) {
    const language = match[1];
    return (
      <div className={className}>
        <div className="flex flex-row justify-between items-center px-4 py-2 text-xs font-mono border-b border-border/50">
          <div className="text-muted-foreground">{language}</div>
          <CopyText text={text} />
        </div>
        <SyntaxHighlighter
          {...rest}
          PreTag="div"
          children={String(children).replace(/\n$/, "")}
          language={language}
          style={style}
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
      <code {...rest} className={className}>
        {children}
      </code>
    );
  }
};

const GeminiCodeRenderer = (props) => {
  const isBlock = /language-(\w+)/.test(props.className || "");
  const className = props.className;
  return <GeminiCode {...props} className={className} />;
};

const geminiComponentsMap = {
  ...baseAnimatedComponents,
  sup: (props) => {
    const AnimatedSup = baseAnimatedComponents.sup;
    return <AnimatedSup {...props} style={{ marginLeft: "0.3em" }} />;
  },
  a: (props) => {
    const { children, className, node, ...rest } = props;
    return (
      // <a href={rest.href} className="text-muted-foreground">
      //   {children}
      // </a>
      <LinkTooltip rest={rest}>{children}</LinkTooltip>
    );
  },
  table: AnimatedTableWrapper,
  code: GeminiCodeRenderer,
};
const problematicTags = ["div", "pre", "tool", "output", "think"];

const CustomParagraph = ({ node, children, className, ...props }) => {
  const hasBlockChild = React.Children.toArray(children).some((child) => {
    if (!child || !child.type) return false;
    return problematicTags?.includes(
      child.type.displayName || child.type.name || child.type,
    );
  });

  if (hasBlockChild) {
    return (
      <div {...props} className={className}>
        {children}
      </div>
    );
  }

  return (
    <p {...props} className={className}>
      {children}
    </p>
  );
};

const AnimatedCustomParagraph = withAnimation(
  CustomParagraph,
  "mb-4 leading-relaxed",
);

const customComponentMap = {
  ...baseAnimatedComponents,
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
  table: AnimatedTableWrapper,
  pre({ node, children, ...props }) {
    // If the only child is "code" with `language-search`, skip wrapping in <pre>
    if (
      node.children &&
      node.children[0]?.tagName === "code" &&
      (node.children[0]?.properties?.className?.includes("language-search") ||
        node.children[0]?.properties?.className?.includes("language-query") ||
        node.children[0]?.properties?.className?.includes("language-tool") ||
        node.children[0]?.properties?.className?.includes("language-output"))
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

    // --- HANDLE INLINE CODE (` ... `) ---
    if (text && text.startsWith("math-inline:")) {
      const math = text.slice("math-inline:".length);
      return <InlineMath>{math}</InlineMath>;
    }

    const match = /language-(\w+)/.exec(className || "");
    if (match) {
      const language = match[1];

      function CustomPreTag({ children, ...restPre }) {
        return (
          <div
            {...restPre}
            className="flex flex-col overflow-x-auto w-full min-w-0"
          >
            <div className="flex flex-row justify-between text-xs mb-4">
              <div>{language}</div>
              <CopyText text={text} />
            </div>
            {children}
          </div>
        );
      }

      if (language === "search") {
        return (
          <SearchBlock
            {...rest}
            className={cn(className, "overflow-x-auto w-full min-w-0")}
          >
            {children}
          </SearchBlock>
        );
      }
      if (language === "tool") {
        return (
          <ToolBlock
            {...rest}
            className={cn(className, "overflow-x-auto w-full min-w-0")}
          >
            {children}
          </ToolBlock>
        );
      }
      if (language === "query") {
        return (
          <QueryBlock
            {...rest}
            className={cn(className, "overflow-x-auto w-full min-w-0")}
          >
            {children}
          </QueryBlock>
        );
      }
      if (language === "output") {
        return (
          <OutputBlock
            {...rest}
            className={cn(className, "overflow-x-auto w-full min-w-0")}
          >
            {children}
          </OutputBlock>
        );
      }
      return (
        <SyntaxHighlighter
          {...rest}
          PreTag={CustomPreTag}
          children={String(children).replace(/\n$/, "")}
          language={match[1]}
          style={style}
        />
      );
    } else {
      return (
        <code
          {...rest}
          className={cn(className, "overflow-x-auto w-full min-w-0")}
        >
          {children}
        </code>
      );
    }
  },
  // tool({ node, children, ...props }) {
  //   const status = React.useContext(StatusContext);
  //   return (
  //     <ToolBlock {...props} status={status}>
  //       {children}
  //     </ToolBlock>
  //   );
  // },
  // output({ node, children, ...props }) {
  //   const status = React.useContext(StatusContext);
  //   return (
  //     <OutputBlock {...props} status={status}>
  //       {children}{" "}
  //     </OutputBlock>
  //   );
  // },
  // query({ node, children, ...props }) {
  //   const status = React.useContext(StatusContext);
  //   return (
  //     <QueryBlock {...props} status={status}>
  //       {children}{" "}
  //     </QueryBlock>
  //   );
  // },
  // search({ node, children, ...props }) {
  //   const status = React.useContext(StatusContext);
  //   return (
  //     <SearchBlock {...props} status={status}>
  //       {children}
  //     </SearchBlock>
  //   );
  // },
  think({ node, children, ...props }) {
    const status = React.useContext(StatusContext);

    return (
      <ThinkingBlockEmbedded {...props} status={status}>
        {children}
      </ThinkingBlockEmbedded>
    );
  },
  p: AnimatedCustomParagraph,
};
const openaiComponentsMap = {
  ...baseAnimatedComponents,
  sup: (props) => {
    const AnimatedSup = baseAnimatedComponents.sup;
    return <AnimatedSup {...props} style={{ marginLeft: "0.3em" }} />;
  },
  a(props) {
    const { children, className, node, ...rest } = props;
    if (!rest.href.includes("http")) {
      return <a href={rest.href}>{children}</a>;
    } else {
      return <LinkTooltip rest={rest}>{children}</LinkTooltip>;
    }
  },
  table: AnimatedTableWrapper,
  pre({ node, children, ...props }) {
    // Default: keep pre
    return <pre {...props}>{children}</pre>;
  },
  code(props) {
    const { children, className, node, ...rest } = props;
    const text = children;

    if (text && text.startsWith("math-inline:")) {
      const math = text.slice("math-inline:".length);
      return <InlineMath>{math}</InlineMath>;
    }
    const match = /language-(\w+)/.exec(className || "");
    if (match) {
      const language = match[1];
      function CustomPreTag({ children, ...restPre }) {
        return (
          <div
            {...restPre}
            className="flex flex-col overflow-x-auto w-full min-w-0"
          >
            <div className="flex flex-row justify-between text-xs mb-4">
              <div>{language}</div>
              <CopyText text={text} />
            </div>
            {children}
          </div>
        );
      }

      return (
        <SyntaxHighlighter
          {...rest}
          PreTag={CustomPreTag}
          children={String(children).replace(/\n$/, "")}
          language={match[1]}
          style={style}
        />
      );
    } else {
      return (
        <code
          {...rest}
          className={cn(className, "overflow-x-auto w-full min-w-0")}
        >
          {children}
        </code>
      );
    }
  },
  p: AnimatedCustomParagraph,
};
const customMapping = {
  Gemini: geminiComponentsMap,
  OpenAI: openaiComponentsMap,
  Custom: customComponentMap,
};

export function ThinkingBlockEmbedded({ children, ...rest }) {
  const [isExpanded, setIsExpanded] = useState(true);
  // console.log("ThinkingBlock props:", rest.props);
  // console.log("ThinkingBlock children type:", typeof children);
  // console.log("ThinkingBlock children length:", React.Children.count(children));
  let status = rest?.status;
  if (children) {
    status = "done";
  }

  // console.log("children:", children);
  // console.log("status:", status);

  useEffect(() => {
    // console.log(rest.props.botMessage.status, "changed");
    if (status === "done") {
      setIsExpanded(false);
    }
  }, [status]);

  return (
    <div className="overflow-hidden overflow-x-auto rounded-lg bg-muted/30 mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center rounded-lg gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
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
        <div className=" px-4  pt-4 text-sm text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

function BasicMarkdown({ children }) {
  return (
    <Markdown className="pb-4 break-words prose prose-zinc dark:prose-invert !max-w-none">
      {children}
    </Markdown>
  );
}

export default function AnimatedMarkdown({
  content,
  status,
  mappingName = "Gemini",
}) {
  const componentMap = customMapping[mappingName];
  const contentToRender = useSmoothStream(content, status, {
    boundaries: /\n+/gu,
  });
  // console.log(mappingName, contentToRender);
  return (
    <StatusContext.Provider value={status}>
      <Markdown
        remarkPlugins={[
          [remarkMath, { singleDollarTextMath: false }],
          remarkGfm,
        ]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        className="pb-4 break-words prose prose-zinc dark:prose-invert !max-w-none"
        components={componentMap}
      >
        {contentToRender}
      </Markdown>
    </StatusContext.Provider>
  );
}
