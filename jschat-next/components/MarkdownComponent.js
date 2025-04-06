import Markdown from "react-markdown";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeMathjax from "rehype-mathjax";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import rehypeFormat from "rehype-format";
import { visit } from "unist-util-visit";

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
const preprocessMarkdown = (text) => {
  // return text;
  let processedTexts = text.replace(
    /<think>([\s\S]*?)<\/think>/g,
    "\n\n<think>\n$1\n</think>\n\n"
  );
  // Replace \[ ... \] with $$ ... $$ for block math
  // processedTexts = processedTexts.replace(
  //   /\\\[(.*?)\\\]/gs,
  //   (_, match) => `$$${match}$$`
  // );
  processedTexts = processedTexts.replace(/\\\[/g, "```math ");
  processedTexts = processedTexts.replace(/\\\]/g, "```");
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
export default function MarkdownComponent(props) {
  const processedText = preprocessMarkdown(props.children);
  // console.log("processedText", processedText);

  const { think, content } = extractThinKContent(processedText);
  // console.log("think ", think);
  // console.log("content ", content);

  const style = a11yDark;
  let language;
  // console.log("markdown props.children", props.children);
  // console.log("markdown processedText", processedText);
  return (
    <>
      {think && (
        <Markdown
          remarkPlugins={[
            [remarkMath, { singleDollarTextMath: true }],
            remarkGfm,
          ]}
          rehypePlugins={[
            rehypeKatex,
            // rehypeRaw
          ]}
          // children={props.children}
          className={`markdown-body text-gray-500 italic`}
          // skipHtml={true}
          components={{
            code(props) {
              const { children, className, node, ...rest } = props;
              const text = children;
              // console.log("code children", children);
              // console.log("code className", className);
              // console.log("node", node)
              // console.log("...rest", rest)
              const match = /language-(\w+)/.exec(className || "");
              if (match) {
                // set language
                language = match[1];
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
          {think}
        </Markdown>
      )}
      <Markdown
        remarkPlugins={[
          [remarkMath, { singleDollarTextMath: true }],
          remarkGfm,
        ]}
        rehypePlugins={[
          rehypeKatex,
          rehypeFormat,
          // rehypeStringify,
          // rehypeRaw
        ]}
        // children={props.children}
        className={`markdown-body`}
        // skipHtml={true}
        components={{
          code(props) {
            const { children, className, node, ...rest } = props;
            const text = children;
            // console.log("code children", children);
            // console.log("code className", className);
            // console.log("node", node)
            // console.log("...rest", rest)
            const match = /language-(\w+)/.exec(className || "");
            if (match) {
              // set language
              language = match[1];
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
          // think: CustomThink, // Handle <think> tags separately
          // think({ node, children }) {
          //   // console.log("node", node);
          //   // console.log("children", children);
          //   return <CustomThink>{children}</CustomThink>;
          // },
        }}
      >
        {content}
      </Markdown>
    </>
  );
}

const CustomThink = ({ children }) => {
  return <span className="text-gray-500 italic">{children}</span>;
};
