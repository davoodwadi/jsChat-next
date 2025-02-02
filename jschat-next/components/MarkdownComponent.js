import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  dark,
  light,
  twilight,
  a11yDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
// import { Inter } from "next/font/google";
import CopyText from "@/components/CopyTextComponent";
// import "@/node_modules/github-markdown-css/github-markdown.css";
import "@/styles/markdown.css";
// const inter = Inter({ subsets: ["latin"] });
const preprocessMarkdown = (text) => {
  // return text;
  return text.replace(
    /<think>([\s\S]*?)<\/think>/g,
    "\n\n<think>\n$1\n</think>\n\n"
  );
};
export default function MarkdownComponent(props) {
  const processedText = preprocessMarkdown(props.children);
  const style = a11yDark;
  let language;
  // console.log("markdown props.children", props.children);
  console.log("markdown processedText", processedText);
  return (
    <>
      <Markdown
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        remarkPlugins={[remarkGfm, remarkMath]}
        // children={props.children}
        className={`markdown-body `}
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
          think({ node, children }) {
            console.log("node", node);
            console.log("children", children);
            return <CustomThink>{children}</CustomThink>;
          },
        }}
      >
        {processedText}
      </Markdown>
    </>
  );
}

const CustomThink = ({ children }) => {
  return <span className="text-gray-500 italic">{children}</span>;
};
