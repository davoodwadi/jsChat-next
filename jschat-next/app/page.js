"use client"

import { useChat } from "ai/react"

function getDummyBotResponse({ chain }) {
  const charSet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789        "

  const length = 3 // adjust the length as needed
  const randomText = Array.from({ length }, () =>
    charSet.charAt(Math.floor(Math.random() * charSet.length))
  ).join("")
  // console.log("chain inner", chain);
  return (
    `${chain[chain.length - 1].content} ${chain[chain.length - 1].key}` +
    randomText
  )
}

function UserMessage(props) {
  return (
    <div
      contentEditable="true"
      suppressContentEditableWarning
      data-placeholder="New message"
      className="min-w-fit max-w-[95vw] flex-1 m-1 bg-blue-400 p-1 dark:bg-blue-600" //border-2 border-blue-500
      onKeyDown={props.handleEnter}
      id={props.id}
      ref={props.refElementUser}
    >
      {props.children}
    </div>
  )
}

function BotMessage(props) {
  // console.log("botMessage rendering");
  const classExtra = props.last ? " min-w-[90vw] " : "  " // min-w-fit
  const classString =
    "flex-1 bg-yellow-400 p-1 max-w-[95vw] dark:bg-yellow-600 m-1" + classExtra
  // console.log("classString", classString)
  return (
    <div
      contentEditable="true"
      suppressContentEditableWarning
      className={classString} //border-yellow-500
      id={props.id}
      ref={props.refElementBot}
    >
      {props.children}
    </div>
  )
}

function Branch(props) {
  //   console.log("branch props.messages", props.messages);
  // let classStyle = props.level === 0 ? "flex-1 p-1" : "flex-1 py-1" //border-2 border-red-300
  let classStyle = "flex-1 " //border-2 border-red-300
  // classStyle += " flex-col "
  return (
    <div id={"branch" + props.id} className={classStyle}>
      {props.children}
    </div>
  )
}

function BranchContainer(props) {
  return (
    <div
      id={"branch-container" + props.id}
      className="flex flex-row flex-nowrap justify-between overflow-auto" //border-4 border-green-300
    >
      {props.children}
    </div>
  )
}

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()
  console.log("client messages:", messages)
  // const messages = [
  //   { role: "system", content: "you are a helpful assistant" },
  //   { role: "user", content: "count to 10" },
  //   { role: "system", content: "there you go: 1, 2, 3, ..." },
  // ]
  // const response = await fetch("http://127.0.0.1:3000/api", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(messages),
  // })
  // const responseJson = await response.json()
  // const responseObject = JSON.parse(responseJson)
  // console.log("responseObject", responseObject)

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === "user" ? "User: " : "AI: "}
          {m.toolInvocations ? (
            <pre>{JSON.stringify(m.toolInvocations, null, 2)}</pre>
          ) : (
            <p>{m.content}</p>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>

    // <div className="items-center py-8 pb-20 gap-16  sm:py-20 min-h-screen">
    //   <main className="flex flex-col gap-8 ">
    //     <div id="chat-container" className="mx-2 my-2">
    //       <BranchContainer>
    //         <Branch level={0}>
    //           <UserMessage>{responseObject[1].content}</UserMessage>
    //           <BotMessage>{responseObject[2].content}</BotMessage>
    //         </Branch>
    //       </BranchContainer>

    //     </div>
    //     <button>focus</button>
    //   </main>
    // </div>
  )
}
