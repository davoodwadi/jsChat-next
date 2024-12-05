"use client"

import { useState } from "react"
import { generate } from "@/app/api/chat/actions"
import { readStreamableValue } from "ai/rsc"
import Toast from "./Toast"

export default function ChatComponent() {
  const [messages, setMessages] = useState([
    { role: "user", content: "count to 6", id: 1 },
  ])
  const [warning, setWarning] = useState(null)
  // const messages = [
  //   { role: "system", content: "you are a helpful assistant" },
  //   { role: "user", content: "count to 10" },
  //   { role: "system", content: "there you go: 1, 2, 3, ..." },
  // ]

  console.log("client messages:", messages)
  async function submitMessage(event) {
    const response = await generate(messages)
    console.log("response", response)
    if (response.status === "ok") {
      let chunks = ""
      for await (const delta of readStreamableValue(response.output)) {
        console.log("client stream:", delta)
        chunks += delta
        setMessages([...messages, { role: "assistant", content: `${chunks}` }])
        setWarning(null)
      }
    } else if (response.status === "Not Authenticated") {
      setWarning(response.status)
    }
  }

  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? "User: " : "AI: "}
          {message.content}
        </div>
      ))}
      <button onClick={submitMessage}>generate</button>
      <Toast>{warning}</Toast>
    </>
  )
}
