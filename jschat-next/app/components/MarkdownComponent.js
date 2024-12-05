"use client"

import Markdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import {
  dark,
  light,
  twilight,
  a11yDark,
} from "react-syntax-highlighter/dist/esm/styles/prism"

export default function MarkdownComponent(props) {
  const style = a11yDark
  const model = props?.model
  console.log("markdown model:", model)

  return (
    <>
      {/* <div dangerouslySetInnerHTML={{ __html: result }} /> */}
      {/* <Markdown remarkPlugins={[remarkGfm]}>{markdownSample}</Markdown> */}
      <Markdown
        children={props.children}
        components={{
          code(props) {
            const { children, className, node, ...rest } = props
            const text = children
            // console.log("children", children)
            // console.log("className", className)
            // console.log("node", node)
            // console.log("...rest", rest)
            const match = /language-(\w+)/.exec(className || "")
            if (match) {
              // known code block
              function CustomPreTag({ children, ...rest }) {
                console.log("children", children)
                console.log("rest", rest)
                return (
                  <div {...rest} className="flex flex-col ">
                    <div className="flex flex-row justify-between text-xs mb-4">
                      <div>{model}</div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(text)
                          // Optional: display success message or update state
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          className="icon fill-current text-green-600"
                        >
                          <path d="M64 464l224 0c8.8 0 16-7.2 16-16l0-64 48 0 0 64c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64l64 0 0 48-64 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16zM224 304l224 0c8.8 0 16-7.2 16-16l0-224c0-8.8-7.2-16-16-16L224 48c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16zm-64-16l0-224c0-35.3 28.7-64 64-64L448 0c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64l-224 0c-35.3 0-64-28.7-64-64z" />
                        </svg>
                      </button>
                    </div>
                    {children}
                  </div>
                )
              }
              return (
                <>
                  <SyntaxHighlighter
                    {...rest}
                    PreTag={CustomPreTag} //"div"
                    children={String(children).replace(/\n$/, "")}
                    language={match[1]}
                    style={style}
                    showLineNumbers
                  />
                </>
              )
            } else {
              return (
                <code {...rest} className={className}>
                  {children}
                </code>
              )
            }
            // return match ? (
            //   <SyntaxHighlighter
            //     {...rest}
            //     PreTag="div"
            //     children={String(children).replace(/\n$/, "")}
            //     language={match[1]}
            //     style={style}
            //   />
            // ) : (
            //   <code {...rest} className={className}>
            //     {children}
            //   </code>
            // )
          },
        }}
      />
    </>
  )
}
