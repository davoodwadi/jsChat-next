import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  dark,
  light,
  twilight,
  a11yDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import CopyText from "@/components/CopyTextComponent";

export default function MarkdownComponent(props) {
  const style = a11yDark;

  return (
    <>
      <Markdown
        rehypePlugins={[rehypeRaw]}
        // remarkPlugins={[rehypeRaw]}
        children={props.children}
        components={{
          code(props) {
            const { children, className, node, ...rest } = props;
            const text = children;
            // console.log("children", children)
            // console.log("className", className)
            // console.log("node", node)
            // console.log("...rest", rest)
            const match = /language-(\w+)/.exec(className || "");
            if (match) {
              // known code block
              function CustomPreTag({ children, ...rest }) {
                // console.log("children", children)
                // console.log("rest", rest)
                return (
                  <div {...rest} className="flex flex-col ">
                    <div className="flex flex-row justify-end text-xs mb-4">
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
      />
    </>
  );
}
