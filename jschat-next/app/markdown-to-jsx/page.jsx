import Markdown from "markdown-to-jsx";
import { compiler } from "markdown-to-jsx";
import React from "react";
import { render } from "react-dom";
import "@/styles/markdown.css";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  dark,
  light,
  twilight,
  a11yDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import CopyText from "@/components/CopyTextComponent";

const md = `
<output>
Title: New Google research: Decoding consumer decision-making
URL: https://business.google.com/us/think/consumer-insights/the-consumer-decision-making-process/
Content: Jonny Protheroe and Sian Davies have been 'decoding' consumer decision-making since 2019. Their latest research reveals where — and how — marketers can experiment and iterate to increase customer confidence and sales in the "messy middle" of the online purchase journey.
Score: 0.7835

# Title: The Power of Consumer Stories in Digital Marketing
URL: https://sloanreview.mit.edu/article/the-power-of-consumer-stories-in-digital-marketing/
Content: Over the past five years, we pursued field research with two companies, BMW AG, the German automaker, and Suruga Bank Ltd., based in Numazu, Japan, to explore the role that story authorship plays in consumer choice. Through this research, we learned that stories significantly increase consumers' engagement with websites and that stories
Score: 0.5852

</output>

$$x = 2$$

$y = 4$

\`\`\`html
<a href="www.google.com" title="ok">text</a>
\`\`\`

# Hello world
\`\`\`js
import js
console.log(Hello)
\`\`\`

\`\`\`
poem...
\`\`\`


<think>
let's think...

\`\`\`js
import js
console.log(Hello)
\`\`\`

</think>


To provide the latest research in consumer choice in marketing research, I should first conduct a web search to find recent studies and publications in this field.

<tool>


search(latest research consumer choice marketing)


</tool>



`;
const style = a11yDark;

export default function MarkdownJSX() {
  //   console.log("a11yDark", a11yDark);
  //   console.log("md", md);

  //   const jsxArray = compiler(md, {
  //     wrapper: null,
  //     // forceInline: true,
  //     overrides: {
  //       code: {
  //         component: CodeBlock,
  //         props: {
  //           className: "foo",
  //         },
  //       },
  //       think: {
  //         component: ThinkBlock,
  //         props: {
  //           className: "text-gray-500 italic",
  //         },
  //       },
  //       tool: {
  //         component: ToolBlock,
  //         props: {
  //           className: "tool",
  //         },
  //       },
  //       output: {
  //         component: OutputBlock,
  //         props: {
  //           className: "output",
  //         },
  //       },
  //     },
  //   });
  //   console.log("jsxArray", jsxArray);
  return (
    <div className="markdown-body">
      <Markdown
        // children={md}
        options={{
          //   forceBlock: true,
          forceWrapper: true,
          overrides: {
            code: {
              component: CodeBlock,
              props: {
                className: "foo",
              },
            },
            think: {
              component: ThinkBlock,
              props: {
                className: "text-gray-500 italic",
              },
            },
            tool: {
              component: ToolBlock,
              props: {
                className: "tool text-green-500",
              },
            },
            output: {
              component: OutputBlock,
              props: {
                className: "output text-red-950",
              },
            },
          },
          createElement(type, props, children) {
            // console.log("type", type);
            // console.log("props", props);
            console.log("children", children);
            return (
              <div key={props?.key} id={props?.id}>
                {React.createElement(type, props, children)}
              </div>
              //   <div key={props?.key} id={props?.id} className="parent">
              //   </div>
            );
          },
        }}
      >
        {md}
      </Markdown>
    </div>
    // <div className="markdown-body">{...jsxArray}</div>
  );
}
function ThinkBlock({ children, ...props }) {
  //   console.log("think typeof children", typeof children);
  //   console.log("think children", children);
  //   console.log("think props", props);
  const newChildren = children.map((c) => {
    const formattedC = typeof c === "string" ? c.trim() : c;
    return formattedC;
  });
  //   console.log("think newChildren", newChildren);

  return <div {...props}>{newChildren}</div>;
}
function OutputBlock({ children, ...props }) {
  console.log("output children", children);
  console.log("output props", props);
  return <div {...props}>{children}</div>;
}
function ToolBlock({ children, ...props }) {
  //   console.log("tool children", children);
  //   console.log("tool props", props);
  return <div {...props}>{children}</div>;
}
function CodeBlock({ children, ...props }) {
  //   console.log("code children", children);
  //   console.log("code children", children);

  let language;
  const match = /lang-(\w+)/.exec(props?.className || "");
  //   console.log("match", match);
  if (match) {
    language = match[1];
    function CustomPreTag({ children, ...props }) {
      //   console.log("props?.text", props?.text);
      //   console.log("props", props);
      return (
        <div {...props} className="flex flex-col ">
          <div className="flex flex-row justify-between text-xs mb-4">
            <div>{language}</div>
            <CopyText text={props?.text} />
          </div>
          {children}
        </div>
      );
    }
    // console.log("children", typeof children);
    return (
      <>
        <SyntaxHighlighter
          {...props}
          text={children}
          PreTag={CustomPreTag} //"div"
          children={children} // String(children).replace(/\n$/, "")
          language={language}
          style={style}
          // showLineNumbers
        />
      </>
    );
  }
  return <blockquote {...props}>{children}</blockquote>;
}
